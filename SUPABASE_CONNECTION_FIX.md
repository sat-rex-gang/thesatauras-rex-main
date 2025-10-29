# Fix Supabase Connection for Migrations

## Issue
The Session Pooler connection isn't working for migrations. We need the correct connection string format.

## Solution

### Step 1: Get the Transaction Pooler Connection String

In your Supabase dashboard:

1. Go to **Project Settings** → **Database**
2. Scroll to **"Connection string"** section
3. Look for **"Transaction"** or **"Transaction Pooler"** tab (not "Session")
4. Select **"Transaction"** mode (or check if there's a transaction pooler option)
5. Copy the connection string from the **"URI"** tab

The Transaction Pooler connection string should look like:
```
postgresql://postgres.sadglfqeyogcumoeikhh:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

OR it might be port 6543:
```
postgresql://postgres.sadglfqeyogcumoeikhh:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### Step 2: Alternative - Use Direct Connection via VPN or Different Network

If you can't get the pooler working, you can:
1. Use the direct connection from a network that supports IPv6
2. Or run migrations from Netlify's build process

### Step 3: Try Transaction Pooler

```powershell
# Replace with the actual Transaction Pooler connection string from Supabase
$env:DATABASE_URL="postgresql://postgres.sadglfqeyogcumoeikhh:AORo5B20fJKjopBC@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
npx prisma migrate deploy --schema=prisma/schema.prisma
```

### Step 4: If Still Failing - Create Migration SQL Manually

Alternatively, we can generate the migration SQL and run it directly in Supabase SQL Editor:

1. In Supabase, go to **SQL Editor**
2. Run this SQL to create the multiplayer tables:

```sql
-- Create multiplayer_games table
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

-- Create multiplayer_players table
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

-- Add foreign keys
ALTER TABLE "multiplayer_games" ADD CONSTRAINT "multiplayer_games_creatorId_fkey" 
    FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "multiplayer_players" ADD CONSTRAINT "multiplayer_players_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "multiplayer_players" ADD CONSTRAINT "multiplayer_players_gameId_fkey" 
    FOREIGN KEY ("gameId") REFERENCES "multiplayer_games"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

3. Run the SQL in Supabase SQL Editor
4. Tables should now be created!

