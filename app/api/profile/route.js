import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { verifyToken } from '../../../lib/auth';
import bcrypt from 'bcryptjs';

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

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        profilePicture: true,
        bio: true,
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

    return NextResponse.json({
      success: true,
      user,
      stats: {
        multiplayer: {
          totalGames: multiplayerGames.length,
          wins,
          losses,
          ties
        }
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
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
    const { username, profilePicture, bio, password, firstName, lastName } = body;

    const updateData = {};

    // Check if username is being changed and if it's available
    if (username) {
      const existingUser = await prisma.user.findUnique({
        where: { username }
      });
      if (existingUser && existingUser.id !== decoded.userId) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        );
      }
      updateData.username = username;
    }

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    
    // Validate and handle profile picture
    if (profilePicture !== undefined) {
      if (profilePicture && profilePicture.trim() !== '') {
        // If it's a base64 string, validate its size (limit to ~500KB base64 = ~375KB image)
        if (profilePicture.startsWith('data:image')) {
          const base64Length = profilePicture.length;
          // Base64 is roughly 4/3 the size of the original, so 500KB base64 ≈ 375KB image
          const maxBase64Size = 500 * 1024; // 500KB in bytes
          
          if (base64Length > maxBase64Size) {
            return NextResponse.json(
              { error: 'Profile picture is too large. Please use an image smaller than 375KB.' },
              { status: 400 }
            );
          }
        }
        updateData.profilePicture = profilePicture;
      } else {
        // Empty string or null should be set to null
        updateData.profilePicture = null;
      }
    }
    
    if (bio !== undefined) updateData.bio = bio;

    // Handle password update
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters long' },
          { status: 400 }
        );
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        profilePicture: true,
        bio: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      meta: error.meta
    });
    
    // Provide more detailed error information in development
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

