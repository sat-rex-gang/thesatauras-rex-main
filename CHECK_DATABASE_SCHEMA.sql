-- Run this in Supabase SQL Editor to check if all required columns exist
-- This will help identify what's missing for multiplayer functionality

-- Check users table columns
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('profilePicture', 'bio', 'totalQuestionsAnswered')
ORDER BY column_name;

-- Check multiplayer_games table columns
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'multiplayer_games' 
AND column_name IN ('gameQuestions', 'creatorId', 'gameMode', 'category', 'questionType', 'numRounds', 'timePerQuestion')
ORDER BY column_name;

-- Check multiplayer_players table columns
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'multiplayer_players' 
AND column_name IN ('wantsRematch', 'isReady', 'score', 'userId', 'gameId')
ORDER BY column_name;

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'multiplayer_games', 'multiplayer_players')
ORDER BY table_name;
