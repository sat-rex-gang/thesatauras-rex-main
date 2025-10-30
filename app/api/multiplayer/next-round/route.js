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

    if (game.status !== 'active') {
      return NextResponse.json(
        { error: 'Game is not active' },
        { status: 400 }
      );
    }

    // Get player
    const player = game.players.find(p => p.userId === decoded.userId);
    if (!player) {
      return NextResponse.json(
        { error: 'You are not part of this game' },
        { status: 403 }
      );
    }

    // For timed mode, calculate scores based on both answers
    if (game.gameMode === 'timed') {
      const currentQuestion = typeof game.currentQuestion === 'string'
        ? JSON.parse(game.currentQuestion)
        : game.currentQuestion;

      if (currentQuestion) {
        // Both players have answered or time is up
        const player1 = game.players[0];
        const player2 = game.players[1];

        const player1Correct = player1.currentAnswer === currentQuestion.Answer;
        const player2Correct = player2.currentAnswer === currentQuestion.Answer;

        // Award points based on results
        if (player1Correct && player2Correct) {
          // Both correct - both get points
          await prisma.multiplayerPlayer.update({
            where: { id: player1.id },
            data: { score: player1.score + 1 }
          });
          await prisma.multiplayerPlayer.update({
            where: { id: player2.id },
            data: { score: player2.score + 1 }
          });
        } else if (player1Correct) {
          // Only player 1 correct
          await prisma.multiplayerPlayer.update({
            where: { id: player1.id },
            data: { score: player1.score + 1 }
          });
        } else if (player2Correct) {
          // Only player 2 correct
          await prisma.multiplayerPlayer.update({
            where: { id: player2.id },
            data: { score: player2.score + 1 }
          });
        }
        // If neither correct, no points awarded
      }
    }

    // Clear answers for next round
    for (const p of game.players) {
      await prisma.multiplayerPlayer.update({
        where: { id: p.id },
        data: {
          currentAnswer: null,
          answeredAt: null
        }
      });
    }

    // Check if game is finished
    const nextRound = game.currentRound + 1;
    if (nextRound > game.numRounds) {
      // Game finished
      await prisma.multiplayerGame.update({
        where: { id: game.id },
        data: {
          status: 'finished',
          currentRound: game.numRounds
        }
      });

      // Get final scores
      const finalGame = await prisma.multiplayerGame.findUnique({
        where: { id: game.id },
        include: { 
          players: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  firstName: true
                }
              }
            }
          }
        }
      });

      // Determine winner (player with highest score)
      // In case of tie, we'll mark as tie
      const sortedPlayers = finalGame.players.sort((a, b) => b.score - a.score);
      const topScore = sortedPlayers[0].score;
      const winners = sortedPlayers.filter(p => p.score === topScore);
      
      // If there's a clear winner, return winner, otherwise it's a tie
      const winner = winners.length === 1 ? winners[0] : null;

      return NextResponse.json({
        success: true,
        gameFinished: true,
        currentRound: game.numRounds,
        winner: winner ? {
          userId: winner.userId,
          id: winner.userId,
          score: winner.score
        } : null,
        isTie: winners.length > 1,
        players: finalGame.players.map(p => ({
          userId: p.userId,
          id: p.userId,
          score: p.score,
          username: p.user?.username,
          firstName: p.user?.firstName
        }))
      });
    }

    // Load next question
    try {
      // For serverless compatibility, fetch from public URL
      const questionFileName = game.category === 'math' 
        ? 'questions_math.json'
        : 'questions_reading.json';
      
      // Construct the URL based on the current request's origin
      const origin = new URL(request.url).origin;
      const questionUrl = `${origin}/${questionFileName}`;
      
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

      // Parse stored question indices
      const questionIndices = JSON.parse(game.questions || '[]');
      const nextQuestionIndex = questionIndices[nextRound - 1];
      const nextQuestion = filteredQuestions[nextQuestionIndex];

      // Move to next round
      await prisma.multiplayerGame.update({
        where: { id: game.id },
        data: {
          currentRound: nextRound,
          currentQuestion: JSON.stringify(nextQuestion),
          questionStartTime: new Date(),
          roundStartTime: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        currentRound: nextRound,
        currentQuestion: nextQuestion,
        gameFinished: false
      });
    } catch (error) {
      console.error('Error loading next question:', error);
      return NextResponse.json(
        { error: 'Failed to load next question' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error moving to next round:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
