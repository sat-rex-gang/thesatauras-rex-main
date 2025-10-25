import { NextResponse } from 'next/server';
import { getAllTags, deleteTag, deleteTagByName } from '../../../lib/flashcards';

export async function GET() {
  try {
    const tags = await getAllTags();
    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const tagId = searchParams.get('id');
  const tagName = searchParams.get('name');

  if (!tagId && !tagName) {
    return NextResponse.json(
      { error: 'Tag ID or name is required' },
      { status: 400 }
    );
  }

  try {
    let result;
    if (tagId) {
      result = await deleteTag(tagId);
    } else {
      result = await deleteTagByName(tagName);
    }

    return NextResponse.json({
      message: `Tag "${result.name}" deleted successfully`,
      deletedTag: result
    });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete tag' },
      { status: 400 }
    );
  }
}
