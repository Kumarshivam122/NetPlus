const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:01Netplus0192-@localhost:5432/NetPlus' });

async function run() {
  try {
    await pool.query("ALTER TABLE orders DROP CONSTRAINT orders_status_check;");
    await pool.query("ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'delivered', 'cancelled', 'returned', 'refunded'));");
    console.log('orders status updated with returned and refunded');
  } catch(e) { console.log(e.message); }
  
  pool.end();
}
run();
