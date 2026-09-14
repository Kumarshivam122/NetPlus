const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Log connection errors
pool.on('error', (err) => {
  console.error('❌ Unexpected PostgreSQL pool error:', err);
});

module.exports = pool;
