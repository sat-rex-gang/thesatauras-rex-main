# Fix Netlify DATABASE_URL

## Problem
Your Netlify `DATABASE_URL` is currently set to `file:./dev.db` (SQLite), but production needs a PostgreSQL connection string.

## Solution

### Step 1: Get Your PostgreSQL Connection String

You need to create/find your PostgreSQL database. Options:

#### Option A: Supabase (Free tier)
1. Go to [supabase.com](https://supabase.com)
2. Create a project
3. Go to Project Settings → Database
4. Copy the "Connection string" under "Connection pooling" (use the URI format)
5. Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

#### Option B: Railway
1. Go to [railway.app](https://railway.app)
2. Create a new project → Add PostgreSQL
3. Click on the PostgreSQL service → Variables tab
4. Copy the `DATABASE_URL` value

#### Option C: Render
1. Go to [render.com](https://render.com)
2. Create a PostgreSQL database
3. Copy the "Internal Database URL"

#### Option D: Neon
1. Go to [neon.tech](https://neon.tech)
2. Create a project
3. Copy the connection string

### Step 2: Set DATABASE_URL in Netlify

**Option 1: Using Netlify Dashboard (Easiest)**
1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Find `DATABASE_URL` and click **Edit**
4. Replace `file:./dev.db` with your PostgreSQL connection string
5. Click **Save**

**Option 2: Using Netlify CLI**
```powershell
# Set the DATABASE_URL (replace with your actual connection string)
netlify env:set DATABASE_URL "postgresql://user:password@host:5432/database"

# Verify it's set
netlify env:get DATABASE_URL
```

### Step 3: Run Migrations

After setting the correct DATABASE_URL:

```powershell
# Option A: Pull env and run (if netlify env:pull works)
netlify env:pull
npx prisma migrate deploy --schema=prisma/schema.prisma

# Option B: Set temporarily and run
$env:DATABASE_URL="your-postgres-connection-string-here"
npx prisma migrate deploy --schema=prisma/schema.prisma
```

### Step 4: Verify

After migrations, test your site:
1. Go to your Netlify site
2. Try to create a multiplayer game
3. If it works, you're done!

## Important Notes

- **Never commit** your PostgreSQL connection string to git
- The connection string format should be: `postgresql://user:password@host:port/database`
- Some providers give you a connection pool URL - use the **direct connection** URL for migrations
- After setting DATABASE_URL in Netlify, you may need to trigger a new deploy

## Example Connection Strings

```
# Supabase (Direct connection - for migrations)
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Railway
postgresql://postgres:[PASSWORD]@containers-us-west-xxx.railway.app:5432/railway

# Render
postgresql://user:password@dpg-xxxxx.oregon-postgres.render.com/dbname
```

