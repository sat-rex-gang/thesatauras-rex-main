#!/bin/bash

# Set DATABASE_URL from NETLIFY_DATABASE_URL if it exists
if [ -n "$NETLIFY_DATABASE_URL" ]; then
  export DATABASE_URL="$NETLIFY_DATABASE_URL"
fi

# Generate Prisma client
npx prisma generate

# Build the Next.js app
npm run build
