import fs from 'fs';
import path from 'path';
import pg from 'pg';
import env from 'dotenv';

env.config();

// Database Connection
const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

async function importDatabase() {
  try {
    console.log('Connecting to database...');
    await db.connect();
    console.log('Connected to database successfully!');

    // Read the SQL dump file
    const sqlFilePath = path.join(process.cwd(), '..', 'c:\\Users\\De-Graft\\OneDrive\\Documents\\sharesphere.sql');
    console.log('Reading SQL file from:', sqlFilePath);
    
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    console.log('SQL file read successfully');

    // Split the SQL content into individual statements
    // We need to handle COPY statements specially
    const statements = [];
    const lines = sqlContent.split('\n');
    let currentStatement = '';
    let inCopyStatement = false;
    let copyData = [];

    for (const line of lines) {
      if (line.startsWith('COPY ')) {
        // Start of a COPY statement
        inCopyStatement = true;
        currentStatement = line;
        copyData = [];
      } else if (inCopyStatement && line === '\.') {
        // End of COPY statement
        inCopyStatement = false;
        currentStatement += ';\n';
        // Add the COPY data
        for (const dataLine of copyData) {
          currentStatement += dataLine + '\n';
        }
        statements.push(currentStatement);
        currentStatement = '';
      } else if (inCopyStatement && line.startsWith('\\')) {
        // Skip pg_dump commands
        continue;
      } else if (inCopyStatement) {
        // Collect COPY data
        copyData.push(line);
      } else if (line.trim() && !line.startsWith('--') && !line.startsWith('SET ') && !line.startsWith('SELECT ')) {
        // Regular SQL statement
        currentStatement += line + '\n';
        if (line.trim().endsWith(';')) {
          statements.push(currentStatement);
          currentStatement = '';
        }
      }
    }

    console.log(`Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}...`);
          await db.query(statement);
          console.log(`Statement ${i + 1} executed successfully`);
        } catch (error) {
          console.error(`Error executing statement ${i + 1}:`, error.message);
          // Continue with other statements even if one fails
        }
      }
    }

    console.log('Database import completed!');
    
    // Verify that tables were created
    const tablesResult = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\nImported tables:');
    tablesResult.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });

  } catch (error) {
    console.error('Database import failed:', error);
  } finally {
    await db.end();
    console.log('Database connection closed');
  }
}

// Run the import
importDatabase(); 