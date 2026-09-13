const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runInit() {
  try {
    console.log(`Connecting to ${process.env.DATABASE_URL.split('@')[1]}...`);
    
    const initSql = fs.readFileSync(path.join(__dirname, 'db', 'init.sql'), 'utf8');
    console.log('Running init.sql...');
    await pool.query(initSql);
    console.log('init.sql executed successfully.');

    process.exit(0);
  } catch (err) {
    console.error('Error running initialization:', err);
    process.exit(1);
  }
}

runInit();
