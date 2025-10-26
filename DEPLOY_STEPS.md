# Quick Deploy Steps for Vercel

## 1. Create Database in Vercel
- Go to Storage tab
- Click "Create" on **Neon** or **Supabase**
- Copy the connection string they provide

## 2. Set Environment Variables in Vercel
In your Vercel project settings → Environment Variables:
- `DATABASE_URL`: Your PostgreSQL connection string from Neon/Supabase
- `JWT_SECRET`: A secure random string (can generate with `openssl rand -base64 32`)

## 3. Push Your Code
```bash
git add .
git commit -m "Configure for Vercel deployment"
git push
```

## 4. After First Deployment - Run Migrations
You need to connect to your database and run the initial migration.

### Option A: Use Neon Console
1. Go to Neon dashboard
2. Use their SQL editor
3. Run the migrations from `prisma/migrations/`

### Option B: Local Connection
```bash
# Get your connection string from Vercel env
# Add to .env.local
echo "DATABASE_URL=your-neon-connection-string" > .env.local

# Run migrations
npx prisma migrate deploy --schema=prisma/schema.prisma
```

### Option C: Use Prisma Studio (Easiest)
```bash
# First, set your env
vercel env pull

# Then open Prisma Studio which will auto-create tables if schema matches
npx prisma studio --schema=prisma/schema.prisma
```

## 5. Test Your Deployment
- Try to register a new user at `/signup`
- If registration works, login should work too

## Troubleshooting
If you still get internal server errors:
1. Check Vercel deployment logs in dashboard
2. Verify DATABASE_URL is correct
3. Make sure migrations ran successfully
4. Ensure JWT_SECRET is set


