import { NextResponse } from 'next/server';
import { recordFlashcardAnswer } from '../../../../lib/flashcards';

export async function POST(request) {
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
