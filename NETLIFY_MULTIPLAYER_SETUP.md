# Netlify Multiplayer Setup Guide

## Critical: Run Database Migrations

The "Internal server error" when creating a game is almost certainly because the `MultiplayerGame` and `MultiplayerPlayer` tables don't exist in your production database yet.

### Step 1: Set Environment Variables in Netlify

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Make sure these are set:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `JWT_SECRET` - Your JWT secret key
   - `NEXT_PUBLIC_SITE_URL` - Your Netlify site URL (optional, will auto-detect)

### Step 2: Run Migrations on Production Database

You need to apply the schema changes to your production database. Here are the options:

#### Option A: Using Netlify CLI (Recommended)

```bash
# Install Netlify CLI if you haven't
npm install -g netlify-cli

# Login to Netlify
netlify login

# Link your project (if not already linked)
netlify link

# Pull all environment variables (creates .env file)
netlify env:pull

# Or get just DATABASE_URL
netlify env:get DATABASE_URL

# After setting DATABASE_URL, run migrations
npx prisma migrate deploy --schema=prisma/schema.prisma
```

**Windows PowerShell:**
```powershell
# Pull environment variables
netlify env:pull

# Or manually set for PowerShell session:
$env:DATABASE_URL="your-postgres-connection-string"
npx prisma migrate deploy --schema=prisma/schema.prisma
```

#### Option B: Using Database Client

1. Connect to your production PostgreSQL database using a client like:
   - pgAdmin
   - DBeaver
   - TablePlus
   - Or the online console provided by your database host

2. Run the migration SQL manually. You can generate it by running:
   ```bash
   npx prisma migrate dev --create-only --schema=prisma/schema.prisma
   ```
   Then copy the SQL from the generated migration file and run it in your database.

#### Option C: Using Prisma Studio (if database allows connections)

```bash
# Set production DATABASE_URL
export DATABASE_URL="your-postgres-connection-string"

# Generate Prisma client for production schema
npx prisma generate --schema=prisma/schema.prisma

# Open Prisma Studio (this will show if tables exist)
npx prisma studio --schema=prisma/schema.prisma
```

### Step 3: Verify Tables Exist

After running migrations, check that these tables exist in your production database:
- `multiplayer_games`
- `multiplayer_players`
- `vocab_state` (if not already there)

You can verify by:
1. Checking Netlify function logs when creating a game
2. Using Prisma Studio to inspect the database
3. Running a simple query in your database client

### Step 4: Redeploy (if needed)

After migrations are complete, trigger a new deploy if needed:
```bash
git commit --allow-empty -m "Trigger rebuild after migrations"
git push
```

### Troubleshooting

#### "Internal server error" persists after migrations

1. **Check Netlify Function Logs:**
   - Go to Netlify dashboard → Your site → Functions tab
   - Click on "api/multiplayer/create"
   - Look for error messages (now includes more details)

2. **Verify Environment Variables:**
   ```bash
   netlify env:list
   ```
   Make sure `DATABASE_URL` and `JWT_SECRET` are set.

3. **Test Database Connection:**
   - Try creating a simple test API route that queries the database
   - Or use Prisma Studio to verify connection

4. **Check Database Permissions:**
   - Ensure your DATABASE_URL has permissions to create tables
   - Some managed databases require running migrations through their console

#### "Table does not exist" error

- Make sure migrations were actually run successfully
- Check that you're using the correct `DATABASE_URL` for production
- Verify the schema.prisma file matches what you deployed

#### Connection timeout errors

- Netlify Functions have execution time limits
- If your database is slow to respond, consider:
  - Using connection pooling (if your DB provider supports it)
  - Using `?pgbouncer=true&connection_limit=1` in your DATABASE_URL
  - Optimizing database queries

### Quick Verification Script

Create a test API route to verify database setup:

```javascript
// app/api/test-db/route.js
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const count = await prisma.multiplayerGame.count();
    return Response.json({ 
      success: true, 
      tableExists: true,
      gameCount: count 
    });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message,
      tableExists: error.message.includes('does not exist') ? false : null
    }, { status: 500 });
  }
}
```

Then visit: `https://your-site.netlify.app/api/test-db`

If this returns an error about tables not existing, you definitely need to run migrations.

