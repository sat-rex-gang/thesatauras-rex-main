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
    const { category, questionType, numRounds, gameMode, timeLimit } = body;

    // Validate input
    if (!category || !['math', 'english'].includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category. Must be "math" or "english"' },
        { status: 400 }
      );
    }

    // Generate unique game code
    let gameCode;
    let exists = true;
    while (exists) {
      gameCode = generateGameCode();
      const existing = await prisma.multiplayerGame.findUnique({
        where: { gameCode }
      });
      if (!existing) {
        exists = false;
      }
    }

    // Create game with creator as player
    const game = await prisma.multiplayerGame.create({
      data: {
        gameCode,
        creatorId: decoded.userId,
        category,
        questionType: questionType || null,
        numRounds: numRounds || 5,
        gameMode: gameMode || 'fast',
        timeLimit: gameMode === 'timed' ? (timeLimit || 30) : null,
        status: 'waiting',
        players: {
          create: {
            userId: decoded.userId,
            isReady: false
          }
        }
      },
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
  } catch (error) {
    console.error('Error creating game:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    
    // Provide more detailed error in development
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message || 'Internal server error';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        ...(process.env.NODE_ENV !== 'production' && { 
          details: error.stack,
          errorName: error.name 
        })
      },
      { status: 500 }
    );
  }
}
