# Add totalQuestionsAnswered Field to Production Database

The production database needs a new field `totalQuestionsAnswered` added to the `users` table.

## Option 1: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase dashboard
2. Click on "SQL Editor" in the left sidebar
3. Run this SQL command:

```sql
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "totalQuestionsAnswered" INTEGER NOT NULL DEFAULT 0;
```

## Option 2: Using Prisma Migrate

On your local machine with the production database URL configured:

```bash
npx prisma migrate deploy --schema=prisma/schema.prisma
```

## Option 3: Manual Migration via SQL

If you have direct database access, connect to your production PostgreSQL database and run:

```sql
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "totalQuestionsAnswered" INTEGER NOT NULL DEFAULT 0;
```

## After Adding the Column

1. The login error should be resolved
2. Users' question counts will start syncing from localStorage to the database
3. The leaderboard will display single player question rankings

## Verification

Check that the column exists:

```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'totalQuestionsAnswered';
```

