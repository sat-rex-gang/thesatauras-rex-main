import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verifyToken } from '../../../../lib/auth';

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
    const { totalQuestionsAnswered } = body;

    if (typeof totalQuestionsAnswered !== 'number') {
      return NextResponse.json(
        { error: 'Invalid totalQuestionsAnswered value' },
        { status: 400 }
      );
    }

    // Update the user's total questions answered
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { totalQuestionsAnswered }
    });

    return NextResponse.json({
      success: true,
      message: 'Questions count synced successfully'
    });
  } catch (error) {
    console.error('Error syncing questions count:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

