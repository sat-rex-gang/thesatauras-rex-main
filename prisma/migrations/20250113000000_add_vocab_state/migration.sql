-- CreateTable
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

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "vocab_state_userId_key" ON "vocab_state"("userId");

-- AddForeignKey
ALTER TABLE "vocab_state" ADD CONSTRAINT "vocab_state_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

