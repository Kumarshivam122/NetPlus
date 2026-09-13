const pool = require('./db/pool');
pool.query('SELECT id, email, status FROM users').then(r => {
  console.log(r.rows);
  process.exit(0);
});
