-- Complete Database Setup for Supabase/PostgreSQL
-- Run this in Supabase SQL Editor to create ALL required tables

-- ==========================================
-- STEP 1: Create Base Tables
-- ==========================================

-- Users table (required for login/authentication)
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username");

-- SAT Scores table
CREATE TABLE IF NOT EXISTS "sat_scores" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "math" INTEGER NOT NULL,
    "reading" INTEGER NOT NULL,
    "writing" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "testDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sat_scores_pkey" PRIMARY KEY ("id")
);

-- Practice Tests table
CREATE TABLE IF NOT EXISTS "practice_tests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "testType" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "practice_tests_pkey" PRIMARY KEY ("id")
);

-- Vocab Progress table
CREATE TABLE IF NOT EXISTS "vocab_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "mastered" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "correct" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "vocab_progress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "vocab_progress_userId_word_key" ON "vocab_progress"("userId", "word");

-- Vocab State table
CREATE TABLE IF NOT EXISTS "vocab_state" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentIndex" INTEGER NOT NULL DEFAULT 0,
    "activeTab" TEXT NOT NULL DEFAULT 'unseen',
    "searchTerm" TEXT NOT NULL DEFAULT '',
    "showWordFirst" BOOLEAN NOT NULL DEFAULT true,
    "isShuffled" BOOLEAN NOT NULL DEFAULT false,
    "knownWords" TEXT NOT NULL DEFAULT '[]',
    "unknownWords" TEXT NOT NULL DEFAULT '[]',
    "starredWords" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "vocab_state_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "vocab_state_userId_key" ON "vocab_state"("userId");

-- Tags table (for flashcards)
CREATE TABLE IF NOT EXISTS "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "tags_name_key" ON "tags"("name");

-- Flashcards table
CREATE TABLE IF NOT EXISTS "flashcards" (
    "id" TEXT NOT NULL,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "flashcards_pkey" PRIMARY KEY ("id")
);

-- User Flashcard Progress table
CREATE TABLE IF NOT EXISTS "user_flashcard_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "flashcardId" TEXT NOT NULL,
    "mastered" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "correct" INTEGER NOT NULL DEFAULT 0,
    "lastReviewed" TIMESTAMP(3),
    "nextReview" TIMESTAMP(3),
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "user_flashcard_progress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_flashcard_progress_userId_flashcardId_key" ON "user_flashcard_progress"("userId", "flashcardId");

-- Flashcard to Tag relation table
CREATE TABLE IF NOT EXISTS "_FlashcardToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_FlashcardToTag_AB_pkey" PRIMARY KEY ("A","B")
);

CREATE INDEX IF NOT EXISTS "_FlashcardToTag_B_index" ON "_FlashcardToTag"("B");

-- ==========================================
-- STEP 2: Create Multiplayer Tables
-- ==========================================

-- Multiplayer Games table
CREATE TABLE IF NOT EXISTS "multiplayer_games" (
    "id" TEXT NOT NULL,
    "gameCode" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "questionType" TEXT,
    "numRounds" INTEGER NOT NULL DEFAULT 5,
    "gameMode" TEXT NOT NULL DEFAULT 'fast',
    "timeLimit" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "currentRound" INTEGER NOT NULL DEFAULT 0,
    "currentQuestion" TEXT,
    "questions" TEXT NOT NULL DEFAULT '[]',
    "questionStartTime" TIMESTAMP(3),
    "roundStartTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "multiplayer_games_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "multiplayer_games_gameCode_key" ON "multiplayer_games"("gameCode");
CREATE INDEX IF NOT EXISTS "multiplayer_games_creatorId_idx" ON "multiplayer_games"("creatorId");

-- Multiplayer Players table
CREATE TABLE IF NOT EXISTS "multiplayer_players" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "currentAnswer" TEXT,
    "answeredAt" TIMESTAMP(3),
    "isReady" BOOLEAN NOT NULL DEFAULT false,
    "hasForfeited" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "multiplayer_players_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "multiplayer_players_userId_gameId_key" ON "multiplayer_players"("userId", "gameId");
CREATE INDEX IF NOT EXISTS "multiplayer_players_userId_idx" ON "multiplayer_players"("userId");
CREATE INDEX IF NOT EXISTS "multiplayer_players_gameId_idx" ON "multiplayer_players"("gameId");

-- ==========================================
-- STEP 3: Add Foreign Keys
-- ==========================================

DO $$ 
BEGIN
    -- Base table foreign keys
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sat_scores_userId_fkey') THEN
        ALTER TABLE "sat_scores" ADD CONSTRAINT "sat_scores_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'practice_tests_userId_fkey') THEN
        ALTER TABLE "practice_tests" ADD CONSTRAINT "practice_tests_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vocab_progress_userId_fkey') THEN
        ALTER TABLE "vocab_progress" ADD CONSTRAINT "vocab_progress_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vocab_state_userId_fkey') THEN
        ALTER TABLE "vocab_state" ADD CONSTRAINT "vocab_state_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_flashcard_progress_userId_fkey') THEN
        ALTER TABLE "user_flashcard_progress" ADD CONSTRAINT "user_flashcard_progress_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_flashcard_progress_flashcardId_fkey') THEN
        ALTER TABLE "user_flashcard_progress" ADD CONSTRAINT "user_flashcard_progress_flashcardId_fkey" 
            FOREIGN KEY ("flashcardId") REFERENCES "flashcards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_FlashcardToTag_A_fkey') THEN
        ALTER TABLE "_FlashcardToTag" ADD CONSTRAINT "_FlashcardToTag_A_fkey" 
            FOREIGN KEY ("A") REFERENCES "flashcards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_FlashcardToTag_B_fkey') THEN
        ALTER TABLE "_FlashcardToTag" ADD CONSTRAINT "_FlashcardToTag_B_fkey" 
            FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    -- Multiplayer foreign keys
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'multiplayer_games_creatorId_fkey') THEN
        ALTER TABLE "multiplayer_games" ADD CONSTRAINT "multiplayer_games_creatorId_fkey" 
            FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'multiplayer_players_userId_fkey') THEN
        ALTER TABLE "multiplayer_players" ADD CONSTRAINT "multiplayer_players_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'multiplayer_players_gameId_fkey') THEN
        ALTER TABLE "multiplayer_players" ADD CONSTRAINT "multiplayer_players_gameId_fkey" 
            FOREIGN KEY ("gameId") REFERENCES "multiplayer_games"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

