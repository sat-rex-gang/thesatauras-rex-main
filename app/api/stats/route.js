import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { verifyToken } from '../../../lib/auth';

export async function GET(request) {
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

    // Get multiplayer stats
    const multiplayerGames = await prisma.multiplayerGame.findMany({
      where: {
        status: { in: ['finished', 'forfeited'] },
        players: {
          some: {
            userId: decoded.userId
          }
        }
      },
      include: {
        players: true
      }
    });

    let wins = 0;
    let losses = 0;
    let ties = 0;

    multiplayerGames.forEach(game => {
      const userPlayer = game.players.find(p => p.userId === decoded.userId);
      const otherPlayer = game.players.find(p => p.userId !== decoded.userId);
      
      if (!otherPlayer) return;

      if (game.status === 'forfeited') {
        const nonForfeited = game.players.find(p => !p.hasForfeited);
        if (nonForfeited?.userId === decoded.userId) {
          wins++;
        } else {
          losses++;
        }
      } else {
        if (userPlayer.score > otherPlayer.score) {
          wins++;
        } else if (userPlayer.score < otherPlayer.score) {
          losses++;
        } else {
          ties++;
        }
      }
    });

    // Get singleplayer stats - use totalQuestionsAnswered from user table
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        totalQuestionsAnswered: true
      }
    });

    const practiceTests = await prisma.practiceTest.findMany({
      where: { userId: decoded.userId }
    });

    return NextResponse.json({
      success: true,
      multiplayer: {
        totalGames: multiplayerGames.length,
        wins,
        losses,
        ties,
        winRate: multiplayerGames.length > 0 ? Math.round((wins / multiplayerGames.length) * 100) : 0
      },
      singleplayer: {
        totalQuestionsAnswered: user?.totalQuestionsAnswered || 0,
        totalTests: practiceTests.length
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    return NextResponse.json(
      { 
        error: 'Internal server error',
        ...(process.env.NODE_ENV !== 'production' && {
          details: error.message
        })
      },
      { status: 500 }
    );
  }
}

