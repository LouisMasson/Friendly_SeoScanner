import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

// For migrations
const migrationClient = postgres(process.env.DATABASE_URL || '', { max: 1 });

async function runMigration() {
  try {
    console.log('Running database migrations...');
    const db = drizzle(migrationClient);
    
    // This will create the tables if they don't exist based on your schema
    await migrate(db, { migrationsFolder: 'migrations' });
    
    console.log('Migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await migrationClient.end();
  }
}

runMigration();