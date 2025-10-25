import { NextResponse } from 'next/server';
import {
  getAllFlashcards,
  getFlashcardById,
  getFlashcardsByTag,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
  getAllTags,
  getUserFlashcardProgress,
  getDueFlashcards,
  recordFlashcardAnswer
} from '../../../lib/flashcards';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const tag = searchParams.get('tag');
  const userId = searchParams.get('userId');
  const due = searchParams.get('due'); // Get due flashcards for user
  const limit = parseInt(searchParams.get('limit')) || 50;
  const offset = parseInt(searchParams.get('offset')) || 0;

  try {
    if (id) {
      const flashcard = await getFlashcardById(id);
      if (!flashcard) {
        return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 });
      }
      return NextResponse.json(flashcard);
    }

    if (tag) {
      const flashcards = await getFlashcardsByTag(tag);
      return NextResponse.json(flashcards);
    }

    if (userId && due === 'true') {
      const dueFlashcards = await getDueFlashcards(userId);
      return NextResponse.json(dueFlashcards);
    }

    if (userId) {
      const progress = await getUserFlashcardProgress(userId);
      return NextResponse.json(progress);
    }

    const flashcards = await getAllFlashcards();
    const paginatedFlashcards = flashcards.slice(offset, offset + limit);

    return NextResponse.json({
      data: paginatedFlashcards,
      pagination: {
        total: flashcards.length,
        limit,
        offset,
        hasMore: offset + limit < flashcards.length
      }
    });
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    return NextResponse.json({ error: 'Failed to fetch flashcards' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { front, back, difficulty, tagNames } = body;

    if (!front || !back) {
      return NextResponse.json(
        { error: 'Front and back content are required' },
        { status: 400 }
      );
    }

    const newFlashcard = await createFlashcard({
      front,
      back,
      difficulty: difficulty || 'medium',
      tagNames: tagNames || []
    });

    return NextResponse.json(newFlashcard, { status: 201 });
  } catch (error) {
    console.error('Error creating flashcard:', error);
    return NextResponse.json({ error: 'Failed to create flashcard' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, front, back, difficulty, tagNames } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Flashcard ID is required' },
        { status: 400 }
      );
    }

    const updatedFlashcard = await updateFlashcard(id, {
      front,
      back,
      difficulty,
      tagNames
    });

    return NextResponse.json(updatedFlashcard);
  } catch (error) {
    console.error('Error updating flashcard:', error);
    return NextResponse.json({ error: 'Failed to update flashcard' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'Flashcard ID is required' },
      { status: 400 }
    );
  }

  try {
    await deleteFlashcard(id);
    return NextResponse.json({ message: 'Flashcard deleted successfully' });
  } catch (error) {
    console.error('Error deleting flashcard:', error);
    return NextResponse.json({ error: 'Failed to delete flashcard' }, { status: 500 });
  }
}

export async function recordAnswer(request) {
  try {
    const body = await request.json();
    const { userId, flashcardId, correct } = body;

    if (!userId || !flashcardId || correct === undefined) {
      return NextResponse.json(
        { error: 'userId, flashcardId, and correct are required' },
        { status: 400 }
      );
    }

    const progress = await recordFlashcardAnswer(userId, flashcardId, correct);
    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error recording answer:', error);
    return NextResponse.json({ error: 'Failed to record answer' }, { status: 500 });
  }
}
