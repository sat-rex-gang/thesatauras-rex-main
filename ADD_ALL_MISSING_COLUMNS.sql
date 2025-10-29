-- Run this in Supabase SQL Editor to add ALL missing columns at once
-- This will fix the login errors on Netlify

-- Add profilePicture column
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "profilePicture" TEXT;

-- Add bio column  
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "bio" TEXT;

-- Add totalQuestionsAnswered column
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "totalQuestionsAnswered" INTEGER NOT NULL DEFAULT 0;

-- Add gameQuestions column to multiplayer_games table
ALTER TABLE "multiplayer_games" ADD COLUMN IF NOT EXISTS "gameQuestions" TEXT;

-- Verify columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('profilePicture', 'bio', 'totalQuestionsAnswered')
ORDER BY column_name;

-- Verify gameQuestions column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'multiplayer_games' 
AND column_name = 'gameQuestions';

