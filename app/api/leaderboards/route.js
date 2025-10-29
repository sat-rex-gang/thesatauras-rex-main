import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(request) {
  try {
    // Get all users with their multiplayer wins
    const users = await prisma.user.findMany({
      include: {
        multiplayerGamePlayers: {
          include: {
            game: {
              include: {
                players: true
              }
            }
          }
        }
      }
    });

    // Calculate stats for each user
    const userStats = users.map(user => {
      // Calculate multiplayer wins
      const finishedGames = user.multiplayerGamePlayers.filter(p => 
        p.game.status === 'finished' || p.game.status === 'forfeited'
      );

      let wins = 0;
      finishedGames.forEach(playerData => {
        const game = playerData.game;
        const currentPlayer = game.players.find(p => p.userId === user.id);
        const otherPlayer = game.players.find(p => p.userId !== user.id);

        if (game.status === 'forfeited') {
          if (!currentPlayer.hasForfeited) {
            wins++;
          }
        } else if (currentPlayer && otherPlayer) {
          if (currentPlayer.score > otherPlayer.score) {
            wins++;
          }
        }
      });

      // Get total questions answered from the user's totalQuestionsAnswered field
      // Default to 0 if field doesn't exist (for backward compatibility)
      const totalQuestionsAnswered = (user.totalQuestionsAnswered !== undefined && user.totalQuestionsAnswered !== null) ? user.totalQuestionsAnswered : 0;

      return {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        multiplayerWins: wins,
        singlePlayerQuestions: totalQuestionsAnswered
      };
    });

    // Sort by multiplayer wins (descending)
    const multiplayerLeaderboard = [...userStats].sort((a, b) => 
      b.multiplayerWins - a.multiplayerWins
    ).map((user, index) => ({
      ...user,
      rank: index + 1
    }));

    // Sort by single player questions (descending)
    const singlePlayerLeaderboard = [...userStats].sort((a, b) => 
      b.singlePlayerQuestions - a.singlePlayerQuestions
    ).map((user, index) => ({
      ...user,
      rank: index + 1
    }));

    return NextResponse.json({
      success: true,
      multiplayer: multiplayerLeaderboard,
      singlePlayer: singlePlayerLeaderboard
    });
  } catch (error) {
    console.error('Error fetching leaderboards:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
    
    // Provide detailed error in development
    const isDevelopment = process.env.NODE_ENV !== 'production';
    return NextResponse.json(
      { 
        error: 'Internal server error',
        ...(isDevelopment && {
          details: error.message,
          errorName: error.name,
          stack: error.stack
        })
      },
      { status: 500 }
    );
  }
}

