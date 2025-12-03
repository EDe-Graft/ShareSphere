import fs from 'fs';
import path from 'path';

const inputFile = 'c:\\Users\\De-Graft\\OneDrive\\Documents\\sharesphere.sql';
const outputFile = 'c:\\Users\\De-Graft\\OneDrive\\Documents\\sharesphere_neon.sql';

try {
    console.log('Reading the original SQL file...');
    const content = fs.readFileSync(inputFile, 'utf8');
    
    console.log('Replacing "postgres" with "neondb_owner"...');
    
    // Replace all instances of "postgres" with "neondb_owner"
    const updatedContent = content.replace(/postgres/g, 'neondb_owner');
    
    console.log('Writing the updated file...');
    fs.writeFileSync(outputFile, updatedContent, 'utf8');
    
    console.log(`✅ Successfully created: ${outputFile}`);
    console.log('Original file preserved as:', inputFile);
    
    // Count the replacements
    const matches = content.match(/postgres/g);
    const count = matches ? matches.length : 0;
    console.log(`📊 Replaced ${count} instances of "postgres" with "neondb_owner"`);
    
} catch (error) {
    console.error('❌ Error:', error.message);
} 