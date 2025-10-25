"use client";

import React from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import FlashcardManager from '../../components/FlashcardManager';
import { useAuth } from '@/contexts/AuthContext';

export default function ManageFlashcards() {
  const { userId } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen py-8 mt-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text0-secondary mb-4">Manage Flashcards</h1>
            <p className="text-tertiary font-semibold">
              Create, edit, and manage your SAT vocabulary flashcards.
              Track your progress with spaced repetition.
            </p>
          </div>
          <FlashcardManager userId={userId} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
