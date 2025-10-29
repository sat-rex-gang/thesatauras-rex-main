# Troubleshooting Login Error on Netlify

## Step 1: Verify Database Tables Were Created

In Supabase SQL Editor, run this to check if tables exist:

```sql
-- Check if users table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'multiplayer_games', 'multiplayer_players');
```

If any tables are missing, run the `setup_complete_database.sql` script.

## Step 2: Check Netlify Environment Variables

Make sure these are set in Netlify (Site Settings → Environment Variables):

1. **DATABASE_URL** - Should be your Supabase PostgreSQL connection string
   - Format: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
   - Or: `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres`

2. **JWT_SECRET** - Must be set (critical for login!)
   - Generate one: `openssl rand -base64 32`
   - Or use any long random string

3. **NEXT_PUBLIC_SITE_URL** - Optional, your site URL

## Step 3: Check Netlify Function Logs

1. Go to Netlify Dashboard → Your Site → **Functions** tab
2. Click on **"api/auth/login"** function
3. Look at the **Logs** section
4. Try logging in again and watch for new error messages
5. The improved error logging should show you the actual error now

## Step 4: Verify Database Connection

The error might be:
- Database connection failing
- `users` table doesn't exist
- Prisma Client not generated correctly
- Wrong DATABASE_URL format

## Step 5: Test Database Connection

In Supabase SQL Editor, test if you can query:

```sql
SELECT COUNT(*) FROM users;
```

If this works, the table exists. If it fails, the table wasn't created properly.

## Common Issues

### Issue: "Table users does not exist"
**Solution**: Run the `setup_complete_database.sql` script in Supabase

### Issue: "Can't reach database server"
**Solution**: 
- Check DATABASE_URL is correct
- Make sure you're using the Session Pooler connection (port 6543) or Transaction Pooler for Netlify

### Issue: "JWT_SECRET is not defined"
**Solution**: Set JWT_SECRET in Netlify environment variables

### Issue: Connection timeout
**Solution**: 
- Use Session Pooler connection string
- Check Supabase project is active (not paused)

