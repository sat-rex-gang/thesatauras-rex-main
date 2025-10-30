import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verifyToken } from '../../../../lib/auth';

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { gameCode } = body;

    if (!gameCode) {
      return NextResponse.json(
        { error: 'Missing gameCode' },
        { status: 400 }
      );
    }

    // Get game
    const game = await prisma.multiplayerGame.findUnique({
      where: { gameCode: gameCode.toUpperCase() },
      include: { players: true }
    });

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    if (game.status !== 'waiting') {
      return NextResponse.json(
        { error: 'Game has already started or finished' },
        { status: 400 }
      );
    }

    // Check if user is the creator
    if (game.creatorId !== decoded.userId) {
      return NextResponse.json(
        { error: 'Only the game creator can start the game' },
        { status: 403 }
      );
    }

    // Check if both players are ready
    if (game.players.length < 2) {
      return NextResponse.json(
        { error: 'Need 2 players to start' },
        { status: 400 }
      );
    }

    const allReady = game.players.every(p => p.isReady);
    if (!allReady) {
      return NextResponse.json(
        { error: 'Not all players are ready' },
        { status: 400 }
      );
    }

    // Load questions and generate first question
    try {
      // For serverless compatibility, fetch from public URL
      // Use the same question file as singleplayer mode
      const questionFileName = game.category === 'math' 
        ? 'questions_math.json'
        : 'questions_reading.json';
      
      // Construct the URL reliably using the current request origin (previous working behavior)
      const questionUrl = `${new URL(request.url).origin}/${questionFileName}`;
      
      console.log('Fetching questions from:', questionUrl);
      
      const response = await fetch(questionUrl);
      if (!response.ok) {
        return NextResponse.json(
          { error: 'Question file not found' },
          { status: 500 }
        );
      }

      const questionsData = await response.json();
      const filteredQuestions = game.questionType
        ? questionsData.filter(q => q.Topic === game.questionType)
        : questionsData;

      if (filteredQuestions.length === 0) {
        return NextResponse.json(
          { error: 'No questions available for selected type' },
          { status: 400 }
        );
      }

      // Store all available questions (as indices) for this game
      const questionIndices = Array.from({ length: filteredQuestions.length }, (_, i) => i);
      // Shuffle indices
      for (let i = questionIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questionIndices[i], questionIndices[j]] = [questionIndices[j], questionIndices[i]];
      }
      
      // Take only as many as we need
      const selectedIndices = questionIndices.slice(0, game.numRounds);
      
      // Get actual questions for history
      const selectedQuestions = selectedIndices.map(idx => filteredQuestions[idx]);
      
      // Get first question
      const firstQuestionIndex = selectedIndices[0];
      const firstQuestion = filteredQuestions[firstQuestionIndex];

      // Update game to active and start first round
      await prisma.multiplayerGame.update({
        where: { id: game.id },
        data: {
          status: 'active',
          currentRound: 1,
          roundStartTime: new Date(),
          questionStartTime: new Date(),
          currentQuestion: JSON.stringify(firstQuestion),
          questions: JSON.stringify(selectedIndices),
          gameQuestions: JSON.stringify(selectedQuestions) // Store actual questions for history
        }
      });

      return NextResponse.json({
        success: true,
        currentRound: 1,
        currentQuestion: firstQuestion
      });
    } catch (error) {
      console.error('Error starting game:', error);
      return NextResponse.json(
        { error: 'Failed to load questions', details: error.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error starting game:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
