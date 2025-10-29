import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verifyToken } from '../../../../lib/auth';

// Generate a random 6-character code
function generateGameCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

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

    // Get original game
    const originalGame = await prisma.multiplayerGame.findUnique({
      where: { gameCode: gameCode.toUpperCase() },
      include: { players: true }
    });

    if (!originalGame) {
      return NextResponse.json(
        { error: 'Original game not found' },
        { status: 404 }
      );
    }

    // Check if both players want rematch
    const bothWantRematch = originalGame.players.every(p => p.wantsRematch);
    if (!bothWantRematch) {
      return NextResponse.json(
        { error: 'Not all players are ready for rematch' },
        { status: 400 }
      );
    }

    // Generate unique game code
    let newGameCode;
    let exists = true;
    while (exists) {
      newGameCode = generateGameCode();
      const existing = await prisma.multiplayerGame.findUnique({
        where: { gameCode: newGameCode }
      });
      if (!existing) {
        exists = false;
      }
    }

    // Create new game with same settings
    const newGame = await prisma.multiplayerGame.create({
      data: {
        gameCode: newGameCode,
        creatorId: originalGame.creatorId,
        category: originalGame.category,
        questionType: originalGame.questionType,
        numRounds: originalGame.numRounds,
        gameMode: originalGame.gameMode,
        timeLimit: originalGame.timeLimit,
        status: 'waiting'
      }
    });

    // Add both players to new game
    for (const player of originalGame.players) {
      await prisma.multiplayerPlayer.create({
        data: {
          userId: player.userId,
          gameId: newGame.id,
          isReady: false,
          wantsRematch: false
        }
      });
    }

    return NextResponse.json({
      success: true,
      game: {
        id: newGame.id,
        gameCode: newGame.gameCode,
        creatorId: newGame.creatorId,
        category: newGame.category,
        questionType: newGame.questionType,
        numRounds: newGame.numRounds,
        gameMode: newGame.gameMode,
        timeLimit: newGame.timeLimit,
        status: newGame.status
      }
    });
  } catch (error) {
    console.error('Error creating rematch:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

