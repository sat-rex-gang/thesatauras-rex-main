-- Step 1: Create users table if it doesn't exist (for fresh databases)
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

-- Step 2: Create multiplayer_games table
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

-- Step 3: Create multiplayer_players table
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

-- Step 4: Add foreign keys (only if they don't exist)
DO $$ 
BEGIN
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
