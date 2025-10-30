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

    if (game.status === 'finished' || game.status === 'forfeited') {
      return NextResponse.json(
        { error: 'Game is already finished' },
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

    // Save answer history for current round if there's a current question
    if (game.currentQuestion && game.gameQuestions) {
      const currentQuestion = typeof game.currentQuestion === 'string'
        ? JSON.parse(game.currentQuestion)
        : game.currentQuestion;
      
      try {
        let gameQuestions = JSON.parse(game.gameQuestions);
        const questionIndex = game.currentRound - 1;
        
        if (questionIndex >= 0 && questionIndex < gameQuestions.length) {
          if (!gameQuestions[questionIndex].playerAnswers) {
            gameQuestions[questionIndex].playerAnswers = {};
          }
          
          // Store each player's answer for this round
          for (const p of game.players) {
            if (p.currentAnswer !== null) {
              const isCorrect = p.currentAnswer === currentQuestion.Answer;
              gameQuestions[questionIndex].playerAnswers[p.userId] = {
                answer: p.currentAnswer,
                isCorrect: isCorrect,
                answeredAt: p.answeredAt
              };
            }
          }
          
          // Update gameQuestions with answer history
          await prisma.multiplayerGame.update({
            where: { id: game.id },
            data: {
              gameQuestions: JSON.stringify(gameQuestions)
            }
          });
        }
      } catch (e) {
        console.error('Error saving answer history on forfeit:', e);
      }
    }

    // Mark player as forfeited
    await prisma.multiplayerPlayer.update({
      where: { id: player.id },
      data: { hasForfeited: true }
    });

    // Mark game as forfeited
    await prisma.multiplayerGame.update({
      where: { id: game.id },
      data: { status: 'forfeited' }
    });

    // Determine winner (the other player)
    const otherPlayer = game.players.find(p => p.userId !== decoded.userId);

    return NextResponse.json({
      success: true,
      winner: otherPlayer ? {
        userId: otherPlayer.userId,
        score: otherPlayer.score
      } : null,
      forfeitedBy: decoded.userId
    });
  } catch (error) {
    console.error('Error forfeiting game:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
