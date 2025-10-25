import React from 'react';
import VocabClient from '../../components/VocabClient';
import { getAllFlashcards, getAllTags } from '../../lib/flashcards';

export default async function Vocab() {
  try {
    const [allFlashcards, allTags] = await Promise.all([
      getAllFlashcards(),
      getAllTags(),
    ]);

    return (
      <VocabClient
        initialFlashcards={allFlashcards}
        initialTags={allTags}
      />
    );
  } catch (error) {
    console.error('Error loading flashcards:', error);
    return (
      <div className="min-h-screen py-8 mt-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-[40px] font-extrabold text-secondary mb-8">Vocabulary Practice</h1>
          <div className="bg-#f23418 border border-#f23418 rounded-lg p-4">
            <p className="text-#f23418">Failed to load flashcards. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }
}