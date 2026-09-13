const pool = require('../db/pool');

function formatCoupon(row) {
  if (!row) return null;
  return {
    id: row.id,
    code: row.code,
    discountPercentage: parseFloat(row.discount_percentage),
    isActive: row.is_active,
    isVisible: row.is_visible,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const Coupon = {
  async find(query = {}) {
    let sql = 'SELECT * FROM coupons';
    const params = [];
    const conditions = [];

    if (query.isActive !== undefined) {
      params.push(query.isActive);
      conditions.push(`is_active = $${params.length}`);
    }
    if (query.isVisible !== undefined) {
      params.push(query.isVisible);
      conditions.push(`is_visible = $${params.length}`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY created_at DESC';

    const { rows } = await pool.query(sql, params);
    return rows.map(formatCoupon);
  },

  async findByCode(code) {
    const { rows } = await pool.query('SELECT * FROM coupons WHERE code = $1', [code]);
    return formatCoupon(rows[0] || null);
  },

  async create(data) {
    const { rows } = await pool.query(
      `INSERT INTO coupons (code, discount_percentage, is_active, is_visible)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [data.code, data.discountPercentage, data.isActive !== false, data.isVisible !== false]
    );
    return formatCoupon(rows[0]);
  },

  async update(id, data) {
    const setClauses = [];
    const values = [];

    if (data.code !== undefined) {
      values.push(data.code);
      setClauses.push(`code = $${values.length}`);
    }
    if (data.discountPercentage !== undefined) {
      values.push(data.discountPercentage);
      setClauses.push(`discount_percentage = $${values.length}`);
    }
    if (data.isActive !== undefined) {
      values.push(data.isActive);
      setClauses.push(`is_active = $${values.length}`);
    }
    if (data.isVisible !== undefined) {
      values.push(data.isVisible);
      setClauses.push(`is_visible = $${values.length}`);
    }

    if (setClauses.length === 0) return null;

    values.push(id);
    const sql = `UPDATE coupons SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`;
    
    const { rows } = await pool.query(sql, values);
    return formatCoupon(rows[0]);
  },

  async delete(id) {
    const { rowCount } = await pool.query('DELETE FROM coupons WHERE id = $1', [id]);
    return rowCount > 0;
  }
};

module.exports = Coupon;
