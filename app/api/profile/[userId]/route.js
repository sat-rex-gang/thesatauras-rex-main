import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verifyToken } from '../../../../lib/auth';

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

    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get the user's profile (excluding password)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        profilePicture: true,
        bio: true,
        totalQuestionsAnswered: true,
        createdAt: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get multiplayer stats
    const multiplayerStats = await prisma.multiplayerPlayer.groupBy({
      by: ['userId'],
      where: { userId: userId },
      _count: {
        id: true
      }
    });

    const totalMultiplayerGames = multiplayerStats[0]?._count?.id || 0;

    // Get wins (games where this user won)
    const wins = await prisma.multiplayerGame.findMany({
      where: {
        status: 'completed',
        players: {
          some: {
            userId: userId,
            score: {
              gt: 0
            }
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

    // Calculate wins, losses, and ties
    let winsCount = 0;
    let lossesCount = 0;
    let tiesCount = 0;

    for (const game of wins) {
      const userPlayer = game.players.find(p => p.userId === userId);
      const otherPlayer = game.players.find(p => p.userId !== userId);
      
      if (userPlayer && otherPlayer) {
        if (userPlayer.score > otherPlayer.score) {
          winsCount++;
        } else if (userPlayer.score < otherPlayer.score) {
          lossesCount++;
        } else {
          tiesCount++;
        }
      }
    }

    return NextResponse.json({
      user: {
        ...user,
        multiplayerStats: {
          totalGames: totalMultiplayerGames,
          wins: winsCount,
          losses: lossesCount,
          ties: tiesCount
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
