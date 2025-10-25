#!/usr/bin/env node

const { execSync } = require('child_process');

// Set DATABASE_URL from NETLIFY_DATABASE_URL if it exists
if (process.env.NETLIFY_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.NETLIFY_DATABASE_URL;
}

console.log('🔧 Building for production...');
console.log('📊 Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');

try {
  // Generate Prisma client
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Build the Next.js app
  console.log('🏗️ Building Next.js app...');
  execSync('next build', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
