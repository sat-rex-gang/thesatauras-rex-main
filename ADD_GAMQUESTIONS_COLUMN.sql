-- Add gameQuestions column to multiplayer_games table
-- Run this in Supabase SQL Editor

ALTER TABLE "multiplayer_games" ADD COLUMN IF NOT EXISTS "gameQuestions" TEXT;

-- Verify column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'multiplayer_games' 
AND column_name = 'gameQuestions';

