-- Run this in Supabase SQL Editor to add ALL missing columns at once
-- This will fix the login errors on Netlify

-- Add profilePicture column
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "profilePicture" TEXT;

-- Add bio column  
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "bio" TEXT;

-- Add totalQuestionsAnswered column
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "totalQuestionsAnswered" INTEGER NOT NULL DEFAULT 0;

-- Verify columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('profilePicture', 'bio', 'totalQuestionsAnswered')
ORDER BY column_name;

