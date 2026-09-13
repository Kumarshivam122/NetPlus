const jwt = require('jsonwebtoken');
const pool = require('./db/pool');
const User = require('./models/User');

async function test() {
  const token = jwt.sign({ id: 'ffcff803-4ed9-4165-9ee5-883bc5399001' }, 'supersecretjwtkey_netplus_2026', { expiresIn: '30d' });
  console.log("Token:", token);


  
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = { 
    status: (code) => ({ json: (data) => console.log('Response:', code, data) }),
    json: (data) => console.log('Response JSON:', data)
  };
  
  // mock protect
  try {
    const decoded = jwt.verify(token, 'supersecretjwtkey_netplus_2026');
    req.user = await User.findById(decoded.id, { excludePassword: true });
    console.log("req.user from middleware:", req.user);
    
    // mock /me
    const user = await User.findById(req.user._id, { excludePassword: true });
    console.log("final /me user:", user);
  } catch(e) {
    console.error(e);
  }
  
  process.exit(0);
}
test();
