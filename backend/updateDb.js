const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:01Netplus0192-@localhost:5432/NetPlus' });

async function run() {
  try {
    await pool.query('ALTER TABLE products ADD COLUMN tax_included BOOLEAN NOT NULL DEFAULT TRUE');
    console.log('tax_included added');
  } catch(e) { console.log(e.message); }
  
  try {
    await pool.query('ALTER TABLE products ADD COLUMN tax_percent NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (tax_percent >= 0 AND tax_percent <= 100)');
    console.log('tax_percent added');
  } catch(e) { console.log(e.message); }
  
  try {
    await pool.query("ALTER TABLE orders DROP CONSTRAINT orders_status_check;");
    await pool.query("ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'delivered', 'cancelled'));");
    console.log('orders status updated');
  } catch(e) { console.log(e.message); }
  
  pool.end();
}
run();
