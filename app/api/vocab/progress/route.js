import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verifyToken } from '../../../../lib/auth';

// Get vocab progress
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

    const userId = decoded.userId;

    // Get user's vocab state from database
    const vocabState = await prisma.vocabState.findUnique({
      where: { userId }
    });

    // Get known, unknown, and starred words from localStorage or create default
    const known = vocabState?.knownWords ? JSON.parse(vocabState.knownWords) : [];
    const unknown = vocabState?.unknownWords ? JSON.parse(vocabState.unknownWords) : [];
    const starred = vocabState?.starredWords ? JSON.parse(vocabState.starredWords) : [];

    return NextResponse.json({
      known,
      unknown,
      starred
    });
  } catch (error) {
    console.error('Error getting vocab progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Save vocab progress
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
    const { known, unknown, starred } = body;

    const userId = decoded.userId;

    // Update vocab state with word progress
    await prisma.vocabState.upsert({
      where: { userId },
      update: {
        knownWords: JSON.stringify(known || []),
        unknownWords: JSON.stringify(unknown || []),
        starredWords: JSON.stringify(starred || [])
      },
      create: {
        userId,
        knownWords: JSON.stringify(known || []),
        unknownWords: JSON.stringify(unknown || []),
        starredWords: JSON.stringify(starred || []),
        currentIndex: 0,
        activeTab: 'unseen',
        searchTerm: '',
        showWordFirst: true,
        isShuffled: false
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving vocab progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

