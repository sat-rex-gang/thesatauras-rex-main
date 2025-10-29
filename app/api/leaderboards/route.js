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
        },
        practiceTests: true
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        profilePicture: true,
        totalQuestionsAnswered: true,
        multiplayerGamePlayers: true
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
      const totalQuestionsAnswered = user.totalQuestionsAnswered || 0;

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
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

