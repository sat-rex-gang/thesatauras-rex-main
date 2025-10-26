import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verifyToken } from '../../../../lib/auth';

// Get current position
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

    // Get or create vocab state
    let vocabState = await prisma.vocabState.findUnique({
      where: { userId: decoded.userId }
    });

    if (!vocabState) {
      vocabState = await prisma.vocabState.create({
        data: {
          userId: decoded.userId,
          currentIndex: 0,
          activeTab: 'unseen',
          searchTerm: '',
          showWordFirst: true,
          isShuffled: false
        }
      });
    }

    return NextResponse.json({
      currentIndex: vocabState.currentIndex,
      activeTab: vocabState.activeTab,
      searchTerm: vocabState.searchTerm,
      showWordFirst: vocabState.showWordFirst,
      isShuffled: vocabState.isShuffled
    });
  } catch (error) {
    console.error('Error getting vocab position:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Save current position
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
    const { currentIndex, activeTab, searchTerm, showWordFirst, isShuffled } = body;

    // Update or create vocab state
    const vocabState = await prisma.vocabState.upsert({
      where: { userId: decoded.userId },
      update: {
        currentIndex: currentIndex ?? undefined,
        activeTab: activeTab ?? undefined,
        searchTerm: searchTerm ?? undefined,
        showWordFirst: showWordFirst ?? undefined,
        isShuffled: isShuffled ?? undefined
      },
      create: {
        userId: decoded.userId,
        currentIndex: currentIndex ?? 0,
        activeTab: activeTab ?? 'unseen',
        searchTerm: searchTerm ?? '',
        showWordFirst: showWordFirst ?? true,
        isShuffled: isShuffled ?? false,
        knownWords: '[]',
        unknownWords: '[]',
        starredWords: '[]'
      }
    });

    return NextResponse.json({ success: true, vocabState });
  } catch (error) {
    console.error('Error saving vocab position:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

