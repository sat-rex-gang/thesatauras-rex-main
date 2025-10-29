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

    // Check if game is joinable
    if (game.status !== 'waiting') {
      return NextResponse.json(
        { error: 'Game is not accepting new players' },
        { status: 400 }
      );
    }

    // Check if user is already in the game
    const existingPlayer = game.players.find(p => p.userId === decoded.userId);
    if (existingPlayer) {
      return NextResponse.json({
        success: true,
        game: {
          id: game.id,
          gameCode: game.gameCode,
          creatorId: game.creatorId,
          category: game.category,
          questionType: game.questionType,
          numRounds: game.numRounds,
          gameMode: game.gameMode,
          timeLimit: game.timeLimit,
          status: game.status,
          players: game.players.map(p => ({
            id: p.userId,
            username: p.user.username,
            firstName: p.user.firstName,
            score: p.score,
            isReady: p.isReady
          }))
        }
      });
    }

    // Check if game is full (max 2 players)
    if (game.players.length >= 2) {
      return NextResponse.json(
        { error: 'Game is full' },
        { status: 400 }
      );
    }

    // Add player to game
    await prisma.multiplayerPlayer.create({
      data: {
        userId: decoded.userId,
        gameId: game.id,
        isReady: false
      }
    });

    // Get updated game with new player
    const updatedGame = await prisma.multiplayerGame.findUnique({
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
        }
      }
    });

    return NextResponse.json({
      success: true,
      game: {
        id: updatedGame.id,
        gameCode: updatedGame.gameCode,
        creatorId: updatedGame.creatorId,
        category: updatedGame.category,
        questionType: updatedGame.questionType,
        numRounds: updatedGame.numRounds,
        gameMode: updatedGame.gameMode,
        timeLimit: updatedGame.timeLimit,
        status: updatedGame.status,
        players: updatedGame.players.map(p => ({
          id: p.userId,
          username: p.user.username,
          firstName: p.user.firstName,
          score: p.score,
          isReady: p.isReady
        }))
      }
    });
  } catch (error) {
    console.error('Error joining game:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
