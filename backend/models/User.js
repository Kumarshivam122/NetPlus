const pool = require('../db/pool');
const bcrypt = require('bcryptjs');

// Helper: Map snake_case DB columns to camelCase for frontend compatibility
function formatUser(row) {
  if (!row) return null;
  return {
    ...row,
    _id: row.id,
    storeName: row.store_name,
    storeType: row.store_type,
    licenceNo: row.licence_no,
    storeAddress: row.store_address,
    ownerName: row.owner_name,
    alternatePhone: row.alternate_phone,
    licenceFileName: row.licence_file_name,
    licenceFileUrl: row.licence_file_url,
    shopPhotoName: row.shop_photo_name,
    shopPhotoUrl: row.shop_photo_url,
    resetOtp: row.reset_otp,
    resetOtpExpiry: row.reset_otp_expiry,
    gstinFileName: row.gstin_file_name,
    gstinFileUrl: row.gstin_file_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function formatUsers(rows) {
  return rows.map(formatUser);
}


const User = {
  async findOne(query) {
    if (query.email) {
      const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [query.email]);
      return formatUser(rows[0] || null);
    }
    return null;
  },

  async findById(id, options = {}) {
    const cols = options.excludePassword
      ? 'id, name, email, role, status, store_name, store_type, licence_no, gstin, store_address, city, state, pincode, owner_name, phone, alternate_phone, licence_file_name, licence_file_url, shop_photo_name, shop_photo_url, gstin_file_name, gstin_file_url, created_at, updated_at'
      : '*';
    const { rows } = await pool.query(`SELECT ${cols} FROM users WHERE id = $1`, [id]);
    return formatUser(rows[0] || null);
  },

  async find(query = {}, options = {}) {
    const cols = options.excludePassword
      ? 'id, name, email, role, status, store_name, store_type, licence_no, gstin, store_address, city, state, pincode, owner_name, phone, alternate_phone, licence_file_name, licence_file_url, shop_photo_name, shop_photo_url, gstin_file_name, gstin_file_url, created_at, updated_at'
      : '*';
    const { rows } = await pool.query(`SELECT ${cols} FROM users ORDER BY created_at DESC`);
    return formatUsers(rows);
  },

  async create(data) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password, role, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        data.name,
        data.email,
        hashedPassword,
        data.role || 'retailer',
        data.status || 'onboarding',
      ]
    );
    return formatUser(rows[0]);
  },

  async update(id, data) {
    // Build dynamic SET clause from data object
    const allowedFields = [
      'name', 'email', 'role', 'status',
      'store_name', 'store_type', 'licence_no', 'gstin',
      'store_address', 'city', 'state', 'pincode',
      'owner_name', 'phone', 'alternate_phone',
      'licence_file_name', 'licence_file_url',
      'shop_photo_name', 'shop_photo_url',
      'gstin_file_name', 'gstin_file_url',
    ];

    // Map camelCase frontend keys to snake_case DB columns
    const keyMap = {
      storeName: 'store_name',
      storeType: 'store_type',
      licenceNo: 'licence_no',
      storeAddress: 'store_address',
      ownerName: 'owner_name',
      alternatePhone: 'alternate_phone',
      licenceFileName: 'licence_file_name',
      licenceFileUrl: 'licence_file_url',
      shopPhotoName: 'shop_photo_name',
      shopPhotoUrl: 'shop_photo_url',
      gstinFileName: 'gstin_file_name',
      gstinFileUrl: 'gstin_file_url',
    };

    const setClauses = [];
    const values = [];
    let paramIdx = 1;

    for (const [key, val] of Object.entries(data)) {
      if (val === undefined) continue;
      const dbCol = keyMap[key] || key;
      if (!allowedFields.includes(dbCol)) continue;
      setClauses.push(`${dbCol} = $${paramIdx}`);
      values.push(val);
      paramIdx++;
    }

    if (setClauses.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const { rows } = await pool.query(
      `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
      values
    );
    
    const updatedUser = rows[0] || null;

    // Synchronize retailer details with cust_details table
    if (updatedUser && updatedUser.role === 'retailer') {
      try {
        await pool.query(
          `INSERT INTO cust_details (user_id, store_name, owner_name, phone, email, city, state, pincode, gstin, licence_no)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (user_id) DO UPDATE SET
             store_name = EXCLUDED.store_name,
             owner_name = EXCLUDED.owner_name,
             phone = EXCLUDED.phone,
             email = EXCLUDED.email,
             city = EXCLUDED.city,
             state = EXCLUDED.state,
             pincode = EXCLUDED.pincode,
             gstin = EXCLUDED.gstin,
             licence_no = EXCLUDED.licence_no`,
          [
            updatedUser.id,
            updatedUser.store_name || '—',
            updatedUser.owner_name || '—',
            updatedUser.phone || '—',
            updatedUser.email || '—',
            updatedUser.city,
            updatedUser.state,
            updatedUser.pincode,
            updatedUser.gstin,
            updatedUser.licence_no
          ]
        );
      } catch (err) {
        console.error('Failed to sync to cust_details:', err);
      }
    }

    return formatUser(updatedUser);
  },

  async matchPassword(enteredPassword, hashedPassword) {
    return bcrypt.compare(enteredPassword, hashedPassword);
  },

  async delete(id) {
    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return rowCount > 0;
  },

  async saveOtp(email, otp, expiry) {
    await pool.query(
      'UPDATE users SET reset_otp = $1, reset_otp_expiry = $2 WHERE email = $3',
      [otp, expiry, email]
    );
  },

  async clearOtp(email) {
    await pool.query(
      'UPDATE users SET reset_otp = NULL, reset_otp_expiry = NULL WHERE email = $1',
      [email]
    );
  },

  async updatePassword(email, newPassword) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);
  }
};

module.exports = User;
