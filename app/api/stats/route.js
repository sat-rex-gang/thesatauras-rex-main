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

    // Get singleplayer stats from practice tests
    // Note: Full question tracking would require storing in DB
    const practiceTests = await prisma.practiceTest.findMany({
      where: { userId: decoded.userId }
    });

    const totalQuestionsAnswered = practiceTests.reduce((sum, test) => sum + (test.score || 0), 0);

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
        totalQuestionsAnswered: 0, // Will be calculated client-side from localStorage
        totalTests: practiceTests.length
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

