import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getAllFlashcards() {
  try {
    return await prisma.flashcard.findMany({
      include: {
        tags: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    throw new Error('Failed to fetch flashcards');
  }
}

export async function getFlashcardById(id) {
  try {
    return await prisma.flashcard.findUnique({
      where: { id },
      include: {
        tags: true,
      },
    });
  } catch (error) {
    console.error('Error fetching flashcard:', error);
    throw new Error('Failed to fetch flashcard');
  }
}

/**
 * Get flashcards by tag name
 */
export async function getFlashcardsByTag(tagName) {
  try {
    return await prisma.flashcard.findMany({
      where: {
        tags: {
          some: {
            name: tagName,
          },
        },
      },
      include: {
        tags: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    console.error('Error fetching flashcards by tag:', error);
    throw new Error('Failed to fetch flashcards by tag');
  }
}

export async function createFlashcard(data) {
  try {
    const { front, back, difficulty = 'medium', tagNames = [] } = data;

    //ensure tags exist
    const tags = [];
    for (const tagName of tagNames) {
      let tag = await prisma.tag.findUnique({
        where: { name: tagName },
      });

      if (!tag) {
        tag = await prisma.tag.create({
          data: { name: tagName },
        });
      }
      tags.push(tag);
    }

    return await prisma.flashcard.create({
      data: {
        front,
        back,
        difficulty,
        tags: {
          connect: tags.map(tag => ({ id: tag.id })),
        },
      },
      include: {
        tags: true,
      },
    });
  } catch (error) {
    console.error('Error creating flashcard:', error);
    throw new Error('Failed to create flashcard');
  }
}

export async function updateFlashcard(id, data) {
  try {
    const { front, back, difficulty, tagNames } = data;

    const updateData = {};
    if (front !== undefined) updateData.front = front;
    if (back !== undefined) updateData.back = back;
    if (difficulty !== undefined) updateData.difficulty = difficulty;

    if (tagNames !== undefined) {
      const tags = [];
      for (const tagName of tagNames) {
        let tag = await prisma.tag.findUnique({
          where: { name: tagName },
        });

        if (!tag) {
          tag = await prisma.tag.create({
            data: { name: tagName },
          });
        }
        tags.push(tag);
      }

      updateData.tags = {
        set: [], //clear tags
        connect: tags.map(tag => ({ id: tag.id })),
      };
    }

    return await prisma.flashcard.update({
      where: { id },
      data: updateData,
      include: {
        tags: true,
      },
    });
  } catch (error) {
    console.error('Error updating flashcard:', error);
    throw new Error('Failed to update flashcard');
  }
}

export async function deleteFlashcard(id) {
  try {
    return await prisma.flashcard.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Error deleting flashcard:', error);
    throw new Error('Failed to delete flashcard');
  }
}

export async function getAllTags() {
  try {
    return await prisma.tag.findMany({
      include: {
        _count: {
          select: { flashcards: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw new Error('Failed to fetch tags');
  }
}

export async function getTagByName(name) {
  try {
    return await prisma.tag.findUnique({
      where: { name },
      include: {
        flashcards: true,
      },
    });
  } catch (error) {
    console.error('Error fetching tag:', error);
    throw new Error('Failed to fetch tag');
  }
}

export async function deleteTag(tagId) {
  try {
    const tagWithFlashcards = await prisma.tag.findUnique({
      where: { id: tagId },
      include: {
        flashcards: {
          select: { id: true }
        }
      }
    });

    if (!tagWithFlashcards) {
      throw new Error('Tag not found');
    }

    // If tag is being used by flashcards, prevent deletion
    if (tagWithFlashcards.flashcards.length > 0) {
      throw new Error(`Cannot delete tag "${tagWithFlashcards.name}" because it's being used by ${tagWithFlashcards.flashcards.length} flashcard(s). Remove the tag from all flashcards first.`);
    }

    // Safe to delete
    return await prisma.tag.delete({
      where: { id: tagId }
    });
  } catch (error) {
    console.error('Error deleting tag:', error);
    throw new Error(error.message || 'Failed to delete tag');
  }
}

export async function deleteTagByName(tagName) {
  try {
    const tagWithFlashcards = await prisma.tag.findUnique({
      where: { name: tagName },
      include: {
        flashcards: {
          select: { id: true }
        }
      }
    });

    if (!tagWithFlashcards) {
      throw new Error('Tag not found');
    }

    if (tagWithFlashcards.flashcards.length > 0) {
      throw new Error(`Cannot delete tag "${tagName}" because it's being used by ${tagWithFlashcards.flashcards.length} flashcard(s). Remove the tag from all flashcards first.`);
    }

    //safe to delete
    return await prisma.tag.delete({
      where: { name: tagName }
    });
  } catch (error) {
    console.error('Error deleting tag:', error);
    throw new Error(error.message || 'Failed to delete tag');
  }
}

export async function getUserFlashcardProgress(userId) {
  try {
    return await prisma.userFlashcardProgress.findMany({
      where: { userId },
      include: {
        flashcard: {
          include: {
            tags: true,
          },
        },
      },
      orderBy: {
        nextReview: 'asc',
      },
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    throw new Error('Failed to fetch user progress');
  }
}

export async function getUserFlashcardProgressById(userId, flashcardId) {
  try {
    return await prisma.userFlashcardProgress.findUnique({
      where: {
        userId_flashcardId: {
          userId,
          flashcardId,
        },
      },
      include: {
        flashcard: {
          include: {
            tags: true,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching user flashcard progress:', error);
    throw new Error('Failed to fetch user flashcard progress');
  }
}

export async function recordFlashcardAnswer(userId, flashcardId, correct) {
  try {
    let progress = await prisma.userFlashcardProgress.findUnique({
      where: {
        userId_flashcardId: {
          userId,
          flashcardId,
        },
      },
    });

    const now = new Date();

    if (!progress) {
      //first time answering the card
      progress = await prisma.userFlashcardProgress.create({
        data: {
          userId,
          flashcardId,
          attempts: 1,
          correct: correct ? 1 : 0,
          lastReviewed: now,
          nextReview: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
          mastered: false,
        },
      });
    } else {
      const newAttempts = progress.attempts + 1;
      const newCorrect = progress.correct + (correct ? 1 : 0);
      const accuracy = newCorrect / newAttempts;

      let newInterval = progress.interval;
      let newEaseFactor = progress.easeFactor;

      if (correct) {
        newInterval = Math.round(progress.interval * progress.easeFactor);
        newEaseFactor = Math.min(progress.easeFactor + 0.1, 2.5);
      } else {
        newInterval = 1; //reset to day 1
        newEaseFactor = Math.max(progress.easeFactor - 0.2, 1.3);
      }

      //cap at 30 days
      newInterval = Math.min(newInterval, 30);

      const nextReviewDate = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);

      progress = await prisma.userFlashcardProgress.update({
        where: {
          userId_flashcardId: {
            userId,
            flashcardId,
          },
        },
        data: {
          attempts: newAttempts,
          correct: newCorrect,
          lastReviewed: now,
          nextReview: nextReviewDate,
          easeFactor: newEaseFactor,
          interval: newInterval,
          mastered: accuracy >= 0.9 && newAttempts >= 5, //mastered if 90%+ and atl 5 attempts
        },
      });
    }

    return progress;
  } catch (error) {
    console.error('Error recording flashcard answer:', error);
    throw new Error('Failed to record flashcard answer');
  }
}

export async function getDueFlashcards(userId) {
  try {
    const now = new Date();

    const [reviewedCards, unreviewedCards] = await Promise.all([
      prisma.userFlashcardProgress.findMany({
        where: {
          userId,
          nextReview: {
            lte: now,
          },
        },
        include: {
          flashcard: {
            include: {
              tags: true,
            },
          },
        },
      }),
      prisma.flashcard.findMany({
        where: {
          NOT: {
            progress: {
              some: {
                userId: userId,
              },
            },
          },
        },
        include: {
          tags: true,
        },
        take: 10, //limit viewing
      }),
    ]);

    return [...reviewedCards, ...unreviewedCards];
  } catch (error) {
    console.error('Error fetching due flashcards:', error);
    throw new Error('Failed to fetch due flashcards');
  }
}

export async function getUserFlashcardStats(userId) {
  try {
    const [
      totalProgress,
      masteredCards,
      dueCards,
    ] = await Promise.all([
      prisma.userFlashcardProgress.findMany({
        where: { userId },
      }),
      prisma.userFlashcardProgress.findMany({
        where: {
          userId,
          mastered: true,
        },
      }),
      prisma.userFlashcardProgress.findMany({
        where: {
          userId,
          nextReview: {
            lte: new Date(),
          },
        },
      }),
    ]);

    const totalAttempts = totalProgress.reduce((sum, p) => sum + p.attempts, 0);
    const totalCorrect = totalProgress.reduce((sum, p) => sum + p.correct, 0);
    const accuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;

    return {
      totalCards: totalProgress.length,
      masteredCards: masteredCards.length,
      dueCards: dueCards.length,
      totalAttempts,
      totalCorrect,
      accuracy: Math.round(accuracy * 100) / 100,
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw new Error('Failed to fetch user stats');
  }
}

export const getAllFlashcardsSync = () => {
  throw new Error('Use getAllFlashcards() instead - this is async');
};
