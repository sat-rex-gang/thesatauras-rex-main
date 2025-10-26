# Vercel Setup Guide

## Critical Steps to Fix Internal Server Error

### 1. Database Setup on Vercel

You need to set up a PostgreSQL database. Options:
- **Vercel Postgres** (Recommended - built-in)
- **Supabase** (Free tier available)
- **Railway** (Free tier available)

### 2. Environment Variables

In your Vercel project settings, add these environment variables:

```
JWT_SECRET=your-very-long-random-secret-key-here
DATABASE_URL=your-postgres-connection-string-here
```

**Important:** For Vercel Postgres, use the direct connection string, not the pooled one.

#### For Vercel Postgres:
1. Go to your Vercel project dashboard
2. Click on "Storage" tab
3. Create/select your Postgres database
4. Copy the "DIRECT_URL" value (not the connection pool URL)
5. Add it as `DATABASE_URL` environment variable

#### Generate JWT_SECRET:
Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

### 3. Database Migration

After setting up the database and environment variables, you need to run the migration:

#### Option A: Using Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Run migration on Vercel
vercel env pull .env.local
npx prisma migrate deploy --schema=prisma/schema.prisma
```

#### Option B: Connect to Database Directly
Use a database client (like DBeaver or pgAdmin) to connect to your production database and run the migrations.

### 4. Initial Setup (First Time)

1. Pull environment variables to your local machine
2. Create a `.env.local` file with:
   ```
   DATABASE_URL=your-postgres-connection-string
   JWT_SECRET=your-jwt-secret
   ```

3. Run migrations locally (against production DB):
   ```bash
   npx prisma migrate deploy --schema=prisma/schema.prisma
   ```

4. Push changes to trigger new deployment:
   ```bash
   git add .
   git commit -m "Fix Vercel deployment"
   git push
   ```

### 5. Common Issues & Solutions

#### Issue: "Internal Server Error" on login
- **Solution**: Database might not be migrated. Run step 3 to migrate.

#### Issue: "Can't reach database server"
- **Solution**: Check that `DATABASE_URL` is using the DIRECT connection, not pooled
- **Solution**: Verify environment variables are set in Vercel dashboard

#### Issue: "JWT_SECRET is not defined"
- **Solution**: Make sure `JWT_SECRET` environment variable is set in Vercel

#### Issue: Database connection timeouts
- **Solution**: Use Vercel Postgres or add connection pooling to your DATABASE_URL:
  ```
  postgresql://user:pass@host:5432/db?pgbouncer=true&connection_limit=1
  ```

### 6. Verify It's Working

After deployment:
1. Try to register a new account
2. If registration works, login should work too
3. Check Vercel logs for any errors: `vercel logs`

### 7. Useful Vercel CLI Commands

```bash
# View deployment logs
vercel logs

# See all environment variables
vercel env ls

# Pull environment variables
vercel env pull

# Deploy
vercel --prod
```

## Quick Checklist

- [ ] PostgreSQL database created (Vercel Postgres, Supabase, or Railway)
- [ ] `DATABASE_URL` environment variable set in Vercel dashboard
- [ ] `JWT_SECRET` environment variable set in Vercel dashboard
- [ ] Database migrations run successfully
- [ ] Project rebuilt on Vercel
- [ ] Test registration and login


