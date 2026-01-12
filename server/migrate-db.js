import pg from "pg";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const db = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    console.log("🔌 Connecting to database...");
    await db.connect();
    console.log("✅ Connected successfully!\n");

    console.log("📋 Running migration: Update email constraint...");
    const migrationSQL = readFileSync(join(__dirname, 'migrate-email-constraint.sql'), 'utf8');

    await db.query(migrationSQL);
    console.log("✅ Migration completed successfully!\n");

    console.log("🔍 Verifying indexes...");
    const indexResult = await db.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'users' AND indexname = 'unique_email_not_null';
    `);

    if (indexResult.rows.length > 0) {
      console.log("✅ Unique partial index created:");
      console.log(`   ${indexResult.rows[0].indexdef}\n`);
    } else {
      console.log("⚠️  Warning: Unique index not found\n");
    }

    console.log("✅ Database migration completed successfully!");

  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    throw error;
  } finally {
    await db.end();
    console.log("🔌 Database connection closed");
  }
}

runMigration();
