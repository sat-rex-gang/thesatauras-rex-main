import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { verifyToken } from '../../../../../lib/auth';

export async function GET(request, { params }) {
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

    const { gameCode } = params;

    if (!gameCode || gameCode.length !== 6) {
      return NextResponse.json(
        { error: 'Invalid game code' },
        { status: 400 }
      );
    }

    // Find game
    const game = await prisma.multiplayerGame.findUnique({
      where: { gameCode: gameCode.toUpperCase() },
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
        },
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true
          }
        }
      }
    });

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // Check if user is in the game
    const player = game.players.find(p => p.userId === decoded.userId);
    if (!player) {
      return NextResponse.json(
        { error: 'You are not part of this game' },
        { status: 403 }
      );
    }

    // Parse current question if it exists
    let currentQuestion = null;
    if (game.currentQuestion) {
      currentQuestion = typeof game.currentQuestion === 'string' 
        ? JSON.parse(game.currentQuestion) 
        : game.currentQuestion;
    }

    return NextResponse.json({
      success: true,
      game: {
        id: game.id,
        gameCode: game.gameCode,
        category: game.category,
        questionType: game.questionType,
        numRounds: game.numRounds,
        gameMode: game.gameMode,
        timeLimit: game.timeLimit,
        status: game.status,
        currentRound: game.currentRound,
        currentQuestion,
        questionStartTime: game.questionStartTime,
        roundStartTime: game.roundStartTime,
        players: game.players.map(p => ({
          id: p.userId,
          username: p.user.username,
          firstName: p.user.firstName,
          score: p.score,
          currentAnswer: p.currentAnswer,
          answeredAt: p.answeredAt,
          isReady: p.isReady,
          hasForfeited: p.hasForfeited
        }))
      }
    });
  } catch (error) {
    console.error('Error getting game:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
