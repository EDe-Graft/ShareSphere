import { exec } from 'child_process';
import { promisify } from 'util';
import env from 'dotenv';

env.config();

const execAsync = promisify(exec);

async function importDatabase() {
  try {
    console.log('Starting database import...');
    
    // Construct the psql command
    const command = `psql -U ${process.env.PG_USER} -h ${process.env.PG_HOST} -p ${process.env.PG_PORT} -d ${process.env.PG_DATABASE} -f "c:\\Users\\De-Graft\\OneDrive\\Documents\\sharesphere.sql"`;
    
    console.log('Executing command:', command);
    
    const { stdout, stderr } = await execAsync(command, {
      env: {
        ...process.env,
        PGPASSWORD: process.env.PG_PASSWORD
      }
    });
    
    if (stdout) {
      console.log('Output:', stdout);
    }
    
    if (stderr) {
      console.log('Errors/Warnings:', stderr);
    }
    
    console.log('Database import completed!');
    
  } catch (error) {
    console.error('Database import failed:', error.message);
    if (error.stdout) {
      console.log('Output:', error.stdout);
    }
    if (error.stderr) {
      console.log('Errors:', error.stderr);
    }
  }
}

// Run the import
importDatabase(); 