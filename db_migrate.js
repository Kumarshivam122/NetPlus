import dotenvx from '@dotenvx/dotenvx';
dotenvx.config();

import pool from './backend/db/pool.js';

async function run() {
  try {
    await pool.query('ALTER TABLE products ADD COLUMN image_url TEXT;');
    console.log('Column image_url added successfully');
  } catch (err) {
    if (err.code === '42701') {
      console.log('Column already exists');
    } else {
      console.error(err);
    }
  } finally {
    process.exit(0);
  }
}
run();
