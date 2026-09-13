require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function updateConstraint() {
  try {
    console.log('Dropping existing status check constraint...');
    await pool.query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check');
    
    console.log('Adding updated status check constraint...');
    await pool.query("ALTER TABLE users ADD CONSTRAINT users_status_check CHECK (status IN ('unverified', 'onboarding', 'pending', 'approved', 'rejected', 'completed'))");
    
    console.log('Successfully updated constraint!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateConstraint();
