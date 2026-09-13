const pool = require('./db/pool');

async function migrate() {
  try {
    // 1. Drop existing CHECK constraint on status
    await pool.query(`ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check`);

    // 2. Add the 'delivered' status into a new CHECK constraint
    await pool.query(`
      ALTER TABLE orders 
      ADD CONSTRAINT orders_status_check 
      CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'delivered'))
    `);

    // 3. Add discount and total columns
    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_code TEXT`);
    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10, 2) DEFAULT 0`);
    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10, 2)`);

    // 4. For existing rows, populate total_amount = unit_price * quantity
    await pool.query(`UPDATE orders SET total_amount = unit_price * quantity WHERE total_amount IS NULL`);

    console.log("Migration successful!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    pool.end();
  }
}

migrate();
