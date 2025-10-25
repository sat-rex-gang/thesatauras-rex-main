@echo off

REM Set DATABASE_URL from NETLIFY_DATABASE_URL if it exists
if defined NETLIFY_DATABASE_URL (
    set DATABASE_URL=%NETLIFY_DATABASE_URL%
)

REM Generate Prisma client
npx prisma generate

REM Build the Next.js app
npm run build
