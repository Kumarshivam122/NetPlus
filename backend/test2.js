const pool = require('./db/pool');
const User = require('./models/User');

async function test() {
  const user = await User.findById('ffcff803-4ed9-4165-9ee5-883bc5399001', { excludePassword: true });
  console.log(user);
  process.exit(0);
}
test();
