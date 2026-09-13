const pool = require('../db/pool');

function addIdAlias(row) {
  if (!row) return null;
  row._id = row.id;
  // Map snake_case DB columns to camelCase for frontend compatibility
  row.orderId = row.order_id;
  row.userId = row.user_id;
  row.userName = row.user_name;
  
  // Parse items if they come back as a string, otherwise use directly
  row.items = typeof row.items === 'string' ? JSON.parse(row.items) : row.items || [];
  
  row.discountCode = row.discount_code;
  row.discountAmount = Number(row.discount_amount);
  row.totalAmount = Number(row.total_amount);
  row.createdAt = row.created_at;
  row.updatedAt = row.updated_at;
  return row;
}

function addIdAliasAll(rows) {
  return rows.map(addIdAlias);
}

const Order = {
  async find(query = {}) {
    const { rows } = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    return addIdAliasAll(rows);
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    return addIdAlias(rows[0] || null);
  },

  async findByUserId(userId) {
    const { rows } = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return addIdAliasAll(rows);
  },

  async create(data) {
    const { rows } = await pool.query(
      `INSERT INTO orders (order_id, user_id, user_name, items, note, status, discount_code, discount_amount, total_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        data.orderId || 'ORD-' + Date.now(),
        data.userId,
        data.userName,
        JSON.stringify(data.items || []),
        data.note || '',
        data.status || 'pending',
        data.discountCode || null,
        data.discountAmount || 0,
        data.totalAmount || 0,
      ]
    );
    return addIdAlias(rows[0]);
  },

  async updateStatus(id, status) {
    const { rows } = await pool.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    return addIdAlias(rows[0] || null);
  },

  async cancelOrder(id, role, userId) {
    // If retailer, they can only cancel their own pending orders
    if (role === 'retailer') {
      const { rows } = await pool.query(
        "UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = $1 AND user_id = $2 AND status = 'pending' RETURNING *",
        [id, userId]
      );
      if (rows.length === 0) {
        throw new Error('Order not found or cannot be cancelled');
      }
      return addIdAlias(rows[0]);
    }
    
    // If admin, they can cancel any order
    if (role === 'admin') {
      const { rows } = await pool.query(
        "UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = $1 RETURNING *",
        [id]
      );
      if (rows.length === 0) {
        throw new Error('Order not found');
      }
      return addIdAlias(rows[0]);
    }
    
    throw new Error('Unauthorized role for cancellation');
  },
};

module.exports = Order;
