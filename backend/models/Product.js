const pool = require('../db/pool');

function formatProduct(row) {
  if (!row) return null;
  return {
    ...row,
    _id: row.id,
    price: Number(row.price),
    mrp: Number(row.mrp),
    taxIncluded: row.tax_included,
    taxPercent: Number(row.tax_percent),
    imageUrl: row.image_url,
    pricing: typeof row.pricing === 'string' ? JSON.parse(row.pricing) : row.pricing || null
  };
}

function formatProducts(rows) {
  return rows.map(formatProduct);
}

const Product = {
  async find(query = {}) {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY name ASC');
    return formatProducts(rows);
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    return formatProduct(rows[0] || null);
  },

  async create(data) {
    const { rows } = await pool.query(
      `INSERT INTO products (name, generic, manufacturer, category, price, mrp, tax_included, tax_percent, unit, stock, rx, image_url, pricing)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        data.name,
        data.generic,
        data.manufacturer,
        data.category,
        data.price,
        data.mrp,
        data.taxIncluded !== undefined ? data.taxIncluded : true,
        data.taxPercent || 0,
        data.unit || 'Strip/10',
        data.stock || 0,
        data.rx || false,
        data.imageUrl || null,
        data.pricing ? JSON.stringify(data.pricing) : null
      ]
    );
    return formatProduct(rows[0]);
  },

  async deleteOne(query) {
    const id = query._id || query.id;
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
  },

  async update(id, data) {
    const { rows } = await pool.query(
      `UPDATE products 
       SET name = COALESCE($1, name),
           generic = COALESCE($2, generic),
           manufacturer = COALESCE($3, manufacturer),
           category = COALESCE($4, category),
           price = COALESCE($5, price),
           mrp = COALESCE($6, mrp),
           tax_included = COALESCE($7, tax_included),
           tax_percent = COALESCE($8, tax_percent),
           unit = COALESCE($9, unit),
           stock = COALESCE($10, stock),
           rx = COALESCE($11, rx),
           image_url = COALESCE($12, image_url),
           pricing = COALESCE($13, pricing),
           updated_at = NOW()
       WHERE id = $14
       RETURNING *`,
      [
        data.name !== undefined ? data.name : null,
        data.generic !== undefined ? data.generic : null,
        data.manufacturer !== undefined ? data.manufacturer : null,
        data.category !== undefined ? data.category : null,
        data.price !== undefined ? data.price : null,
        data.mrp !== undefined ? data.mrp : null,
        data.taxIncluded !== undefined ? data.taxIncluded : null,
        data.taxPercent !== undefined ? data.taxPercent : null,
        data.unit !== undefined ? data.unit : null,
        data.stock !== undefined ? data.stock : null,
        data.rx !== undefined ? data.rx : null,
        data.imageUrl !== undefined ? data.imageUrl : null,
        data.pricing ? JSON.stringify(data.pricing) : null,
        id
      ]
    );
    return formatProduct(rows[0] || null);
  },
};

module.exports = Product;
