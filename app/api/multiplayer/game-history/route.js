import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verifyToken } from '../../../../lib/auth';

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

    // Get all finished games the user participated in
    const games = await prisma.multiplayerGame.findMany({
      where: {
        status: { in: ['finished', 'forfeited'] },
        players: {
          some: {
            userId: decoded.userId
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
                firstName: true,
                profilePicture: true
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Process games to include opponent info and winner
    const gameHistory = games.map(game => {
      const userPlayer = game.players.find(p => p.userId === decoded.userId);
      const otherPlayer = game.players.find(p => p.userId !== decoded.userId);
      
      // Determine winner
      let winner = null;
      if (game.status === 'forfeited') {
        const nonForfeitedPlayer = game.players.find(p => !p.hasForfeited);
        if (nonForfeitedPlayer) {
          winner = nonForfeitedPlayer.userId;
        }
      } else {
        // Compare scores
        const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score);
        const topScore = sortedPlayers[0].score;
        const winners = sortedPlayers.filter(p => p.score === topScore);
        if (winners.length === 1) {
          winner = winners[0].userId;
        }
      }

      // Parse game questions if available
      let questions = [];
      if (game.gameQuestions) {
        try {
          questions = JSON.parse(game.gameQuestions);
        } catch (e) {
          console.error('Error parsing game questions:', e);
        }
      }

      return {
        id: game.id,
        gameCode: game.gameCode,
        category: game.category,
        questionType: game.questionType,
        gameMode: game.gameMode,
        numRounds: game.numRounds,
        createdAt: game.createdAt,
        userScore: userPlayer.score,
        opponentScore: otherPlayer?.score || 0,
        opponent: otherPlayer ? {
          id: otherPlayer.user.id,
          username: otherPlayer.user.username,
          firstName: otherPlayer.user.firstName,
          profilePicture: otherPlayer.user.profilePicture
        } : null,
        winner: winner === decoded.userId ? 'user' : winner === otherPlayer?.userId ? 'opponent' : 'tie',
        status: game.status,
        questions: questions
      };
    });

    return NextResponse.json({
      success: true,
      games: gameHistory
    });
  } catch (error) {
    console.error('Error fetching game history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

