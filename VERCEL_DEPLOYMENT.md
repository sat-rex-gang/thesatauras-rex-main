# Deploy SATsaurus to Vercel

This guide will help you deploy your SATsaurus app to Vercel.

## Prerequisites
- GitHub account
- Vercel account
- Supabase project already set up

## Step 1: Push Code to GitHub

1. Make sure all your changes are committed:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

## Step 2: Import Project to Vercel

1. Go to https://vercel.com and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure the project settings:

## Step 3: Environment Variables

In Vercel project settings, add these environment variables:

### Required Variables:

1. **DATABASE_URL** (Production)
   ```
   postgresql://postgres.sadglfqeyogcumoeikhh:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
   Replace `[YOUR-PASSWORD]` with your Supabase database password

2. **JWT_SECRET**
   - Generate a random secret: `openssl rand -base64 32`
   - Or use any strong random string
   - Example: `your-super-secret-jwt-key-change-this-in-production`

3. **NEXT_PUBLIC_SITE_URL** (Optional but recommended)
   ```
   https://your-vercel-app.vercel.app
   ```

## Step 4: Build Configuration

Vercel will auto-detect Next.js and use the correct build settings. The `package.json` already has the correct scripts.

## Step 5: Deploy

1. Click "Deploy" in Vercel
2. Wait for the build to complete (usually 1-2 minutes)
3. Vercel will provide you with a deployment URL

## Step 6: Database Migrations

After deployment, you need to add the missing columns to your Supabase database:

1. Go to Supabase SQL Editor
2. Run this SQL:

```sql
-- Add profilePicture column
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "profilePicture" TEXT;

-- Add bio column  
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "bio" TEXT;

-- Add totalQuestionsAnswered column
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "totalQuestionsAnswered" INTEGER NOT NULL DEFAULT 0;

-- Add gameQuestions column to multiplayer_games table
ALTER TABLE "multiplayer_games" ADD COLUMN IF NOT EXISTS "gameQuestions" TEXT;
```

3. Verify columns were added:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('users', 'multiplayer_games')
AND column_name IN ('profilePicture', 'bio', 'totalQuestionsAnswered', 'gameQuestions')
ORDER BY table_name, column_name;
```

## Troubleshooting

### "Tenant or user not found" error
- Make sure you're using the **Session Pooler** connection string (port 6543)
- Username must be in format: `postgres.[PROJECT_REF]` not just `postgres`

### Build failures
- Check that all environment variables are set correctly
- Verify `DATABASE_URL` is using port 6543 for Session Pooler

### Database connection issues
- Ensure your Supabase project is active
- Check that the database password is correct
- Verify you're using the Session Pooler endpoint (not direct connection)

## Benefits of Vercel

- ✅ Better Next.js integration and optimization
- ✅ Automatic deployments from GitHub
- ✅ Preview deployments for pull requests
- ✅ Better performance with Edge Functions
- ✅ Easier environment variable management
- ✅ Built-in CI/CD

## Next Steps

After successful deployment:
1. Update your domain name (if you have one) in Vercel settings
2. Test all functionality (login, multiplayer, leaderboards)
3. Monitor the deployment for any errors in Vercel logs

