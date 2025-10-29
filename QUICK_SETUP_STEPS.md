# Quick Setup: PostgreSQL Database for Netlify

## Step 1: Create a Free PostgreSQL Database (Supabase - Easiest)

1. Go to https://supabase.com
2. Click **"Start your project"** or **"Sign in"**
3. Click **"New project"**
4. Fill in:
   - **Name**: Your project name (e.g., "theSATauras")
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest to you
5. Click **"Create new project"**
6. Wait 2-3 minutes for setup to complete

## Step 2: Get Your Connection String

1. Once project is created, go to **Project Settings** (gear icon, bottom left)
2. Click **"Database"** in the left sidebar
3. Scroll to **"Connection string"** section
4. Under **"URI"** tab, copy the connection string
   - Format: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`
5. **IMPORTANT**: Replace `[YOUR-PASSWORD]` with the password you created in Step 1
6. Your final string should look like:
   ```
   postgresql://postgres:your-actual-password@db.abcdefghijklmnop.supabase.co:5432/postgres
   ```

## Step 3: Set DATABASE_URL in Netlify

### Option A: Using Netlify Dashboard (Recommended)

1. Go to https://app.netlify.com
2. Select your site
3. Go to **Site settings** (gear icon in top right)
4. Click **"Environment variables"** in the left sidebar
5. Find `DATABASE_URL` in the list
6. Click the **pencil/edit icon** next to it
7. Replace `file:./dev.db` with your PostgreSQL connection string from Step 2
8. Click **"Save"**

### Option B: Using Netlify CLI

```powershell
# Set the DATABASE_URL (paste your connection string from Step 2)
netlify env:set DATABASE_URL "postgresql://postgres:your-password@db.xxxxx.supabase.co:5432/postgres"

# Verify it's set correctly
netlify env:get DATABASE_URL
```

## Step 4: Run Database Migrations

Now you need to create the tables in your new PostgreSQL database:

```powershell
# Set the connection string temporarily for this session
$env:DATABASE_URL="postgresql://postgres:your-password@db.xxxxx.supabase.co:5432/postgres"

# Run migrations to create all tables
npx prisma migrate deploy --schema=prisma/schema.prisma
```

You should see output like:
```
✔ Applied migration `20250113000000_add_vocab_state`
✔ Applied migration `add_multiplayer` (or similar)
```

## Step 5: Verify It Worked

1. Test your Netlify site - try creating a multiplayer game
2. Check Netlify Function Logs:
   - Go to Netlify Dashboard → Your Site → **Functions** tab
   - Click on `api/multiplayer/create`
   - If there are errors, they'll show here

## Step 6: Trigger New Deploy (Optional)

Netlify should automatically redeploy when you change environment variables, but if needed:

```powershell
# Commit and push to trigger rebuild
git commit --allow-empty -m "Update DATABASE_URL configuration"
git push
```

## Troubleshooting

### "Connection refused" or "Cannot reach database server"
- Make sure you replaced `[YOUR-PASSWORD]` with your actual password
- Check that the connection string is complete
- Verify your Supabase project is "Active" (not paused)

### "Table does not exist" error
- Migrations didn't run successfully - repeat Step 4
- Make sure you used `prisma migrate deploy` (not `migrate dev`)

### Still getting "Internal server error"
1. Check Netlify Function logs for specific error
2. Verify `JWT_SECRET` is also set in Netlify environment variables
3. Make sure your connection string has no extra spaces or quotes

## Alternative: Railway Database (If Supabase doesn't work)

1. Go to https://railway.app
2. Sign in with GitHub
3. Click **"New Project"**
4. Click **"Deploy New"** → **"Database"** → **"PostgreSQL"**
5. Click on the PostgreSQL service
6. Go to **"Variables"** tab
7. Copy the `DATABASE_URL` value
8. Use this in Step 3 above

