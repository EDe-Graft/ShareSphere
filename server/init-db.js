import pg from "pg";
import env from "dotenv";
import { readFileSync } from "fs";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
env.config();

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initializeDatabase() {
  console.log('🚀 Starting database initialization...\n');

  // Create database client - Neon PostgreSQL
  const db = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Connect to database
    console.log('📡 Connecting to Neon PostgreSQL...');
    await db.connect();
    console.log('✅ Connected successfully!\n');

    // Read schema file
    console.log('📖 Reading schema.sql file...');
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');
    console.log('✅ Schema file loaded!\n');

    // Execute schema
    console.log('🔨 Creating tables...');
    await db.query(schema);
    console.log('✅ All tables created successfully!\n');

    // Verify tables were created
    console.log('🔍 Verifying tables...');
    const result = await db.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('✅ Tables in database:');
    result.rows.forEach(row => {
      console.log(`   • ${row.table_name}`);
    });

    console.log('\n🎉 Database initialization completed successfully!');

  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    // Close connection
    await db.end();
    console.log('\n👋 Database connection closed.');
  }
}

// Run the initialization
initializeDatabase();
