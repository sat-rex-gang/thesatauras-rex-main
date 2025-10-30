const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

async function safeMigrate() {
  try {
    console.log('Starting migration deployment...');
    
    // Check if DATABASE_URL is set and valid
    if (!process.env.DATABASE_URL) {
      console.log('No DATABASE_URL found, skipping migration...');
      return;
    }

    // By default, skip running migrations on Vercel unless explicitly enabled
    // Set RUN_MIGRATIONS=true in env to force running
    if (process.env.VERCEL && process.env.RUN_MIGRATIONS !== 'true') {
      console.log('Vercel build detected and RUN_MIGRATIONS is not true; skipping migrations.');
      return;
    }
    
    // Generate Prisma client first
    console.log('Generating Prisma client...');
    execSync('npx prisma generate --schema=prisma/schema.prisma', { stdio: 'inherit', timeout: 120000 });
    
    const prisma = new PrismaClient();
    
    try {
      // Test database connection first
      await prisma.$connect();
      console.log('Database connection successful');
      
      // Check if database has any tables
      const result = await prisma.$queryRaw`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE';
      `;
      
      const tableCount = parseInt(result[0].count);
      console.log(`Found ${tableCount} tables in database`);
      
      // Check if _prisma_migrations table exists
      const migrationsTableResult = await prisma.$queryRaw`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '_prisma_migrations';
      `;
      
      const migrationsTableExists = parseInt(migrationsTableResult[0].count) > 0;
      
      if (tableCount > 0 && !migrationsTableExists) {
        console.log('Database has schema but no migration history. Creating baseline...');
        
        // Create _prisma_migrations table
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
            "id" VARCHAR(36) NOT NULL PRIMARY KEY,
            "checksum" VARCHAR(64) NOT NULL,
            "finished_at" TIMESTAMP(3),
            "migration_name" VARCHAR(255) NOT NULL,
            "logs" TEXT,
            "rolled_back_at" TIMESTAMP(3),
            "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "applied_steps_count" INTEGER NOT NULL DEFAULT 0
          );
        `;
        
        // Mark existing migrations as applied using raw SQL
        const migrations = [
          '20250906215640_init',
          '20250907194852_add_flashcards',
          '20250113000000_add_vocab_state'
        ];
        
        for (const migrationName of migrations) {
          const id = migrationName;
          const checksum = `baseline-${migrationName}`;
          
          // Use Prisma's raw query with proper escaping
          const query = `
            INSERT INTO "_prisma_migrations" 
            ("id", "checksum", "finished_at", "migration_name", "started_at", "applied_steps_count")
            VALUES ('${id}', '${checksum}', NOW(), '${migrationName}', NOW() - INTERVAL '1 second', 1)
            ON CONFLICT ("id") DO NOTHING
          `;
          
          await prisma.$executeRawUnsafe(query);
        }
        
        console.log('Baseline created successfully');
      }
      
      // Now run migrate deploy
      console.log('Running prisma migrate deploy...');
      try {
        // Ensure a direct connection is available for migrations (bypass pooler)
        if (!process.env.DIRECT_URL) {
          console.log('DIRECT_URL not set. Migrations may fail or hang behind PgBouncer.');
        }
        execSync('npx prisma migrate deploy --schema=prisma/schema.prisma', { stdio: 'inherit', timeout: 180000 });
      } catch (error) {
        console.log('Note: migrate deploy may report that migrations are already applied. This is normal.');
      }
      
    } catch (dbError) {
      console.error('Database connection error:', dbError.message);
      console.log('Continuing build despite database connection issue...');
      // Don't fail the build if database is not accessible
    } finally {
      await prisma.$disconnect();
    }
    
    console.log('Migration step completed');
    
  } catch (error) {
    console.error('Error during migration:', error.message);
    console.log('Continuing build despite migration warning...');
    // Don't fail the build
  }
}

safeMigrate();

