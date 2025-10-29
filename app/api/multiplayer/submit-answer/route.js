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
    const { gameCode, answer } = body;

    if (!gameCode || !answer) {
      return NextResponse.json(
        { error: 'Missing gameCode or answer' },
        { status: 400 }
      );
    }

    // Get game
    const game = await prisma.multiplayerGame.findUnique({
      where: { gameCode: gameCode.toUpperCase() },
      include: {
        players: true
      }
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

    if (player.currentAnswer) {
      return NextResponse.json(
        { error: 'You have already submitted an answer for this round' },
        { status: 400 }
      );
    }

    // Parse current question
    const currentQuestion = typeof game.currentQuestion === 'string'
      ? JSON.parse(game.currentQuestion)
      : game.currentQuestion;

    if (!currentQuestion) {
      return NextResponse.json(
        { error: 'No current question' },
        { status: 400 }
      );
    }

    // Check if answer is correct
    const isCorrect = answer === currentQuestion.Answer;

    // Update player's answer
    await prisma.multiplayerPlayer.update({
      where: { id: player.id },
      data: {
        currentAnswer: answer,
        answeredAt: new Date()
      }
    });

    // For fast mode, if this answer is correct and is the first correct answer, award point immediately
    if (game.gameMode === 'fast' && isCorrect) {
      const otherPlayer = game.players.find(p => p.userId !== decoded.userId);
      if (!otherPlayer || !otherPlayer.currentAnswer || otherPlayer.currentAnswer !== currentQuestion.Answer) {
        // First correct answer - award point
        await prisma.multiplayerPlayer.update({
          where: { id: player.id },
          data: { score: player.score + 1 }
        });
      }
    }

    return NextResponse.json({
      success: true,
      isCorrect
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
