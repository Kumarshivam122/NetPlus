const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addPricingColumn() {
  try {
    await pool.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS pricing JSONB');
    console.log('✅ Added pricing column to products table');
    process.exit(0);
  } catch (err) {
    console.error('Error adding pricing column:', err);
    process.exit(1);
  }
}

addPricingColumn();
