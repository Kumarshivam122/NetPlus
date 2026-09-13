import 'dotenv/config';
import pool from './db/pool.js';

async function run() {
  try {
    await pool.query('ALTER TABLE users ADD COLUMN reset_otp TEXT;');
    await pool.query('ALTER TABLE users ADD COLUMN reset_otp_expiry TIMESTAMPTZ;');
    console.log('OTP columns added successfully');
  } catch (err) {
    if (err.code === '42701') {
      console.log('Columns already exist');
    } else {
      console.error(err);
    }
  } finally {
    process.exit(0);
  }
}
run();
