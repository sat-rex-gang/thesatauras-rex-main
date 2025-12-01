import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { verifyToken } from '../../../lib/auth';

export async function GET(request) {
  try {
    // Get userId from query params or auth token
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    // If no userId in query, try to get from auth token
    let currentUserId = userId;
    if (!currentUserId) {
      const token = request.headers.get('authorization')?.replace('Bearer ', '');
      if (token) {
        const decoded = verifyToken(token);
        if (decoded) {
          currentUserId = decoded.userId;
        }
      }
    }

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

    // Get top 10 for each leaderboard
    const top10Multiplayer = multiplayerLeaderboard.slice(0, 10);
    const top10SinglePlayer = singlePlayerLeaderboard.slice(0, 10);

    // Get last place for each leaderboard
    const lastPlaceMultiplayer = multiplayerLeaderboard.length > 0 
      ? multiplayerLeaderboard[multiplayerLeaderboard.length - 1] 
      : null;
    const lastPlaceSinglePlayer = singlePlayerLeaderboard.length > 0 
      ? singlePlayerLeaderboard[singlePlayerLeaderboard.length - 1] 
      : null;

    // Find current user's position if userId is provided
    let currentUserMultiplayer = null;
    let currentUserSinglePlayer = null;
    
    if (currentUserId) {
      const multiplayerUser = multiplayerLeaderboard.find(u => u.id === currentUserId);
      const singlePlayerUser = singlePlayerLeaderboard.find(u => u.id === currentUserId);
      
      // Only include current user if they're not already in top 10
      if (multiplayerUser && multiplayerUser.rank > 10) {
        currentUserMultiplayer = multiplayerUser;
      }
      if (singlePlayerUser && singlePlayerUser.rank > 10) {
        currentUserSinglePlayer = singlePlayerUser;
      }
    }

    return NextResponse.json({
      success: true,
      multiplayer: {
        top10: top10Multiplayer,
        currentUser: currentUserMultiplayer,
        lastPlace: lastPlaceMultiplayer
      },
      singlePlayer: {
        top10: top10SinglePlayer,
        currentUser: currentUserSinglePlayer,
        lastPlace: lastPlaceSinglePlayer
      }
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

