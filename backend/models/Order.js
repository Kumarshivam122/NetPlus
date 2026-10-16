const supabase = require('../db/supabase');

function addIdAlias(row) {
  if (!row) return null;
  const orderNum = row.order_id || row.orderId || ('ORD-' + (row.created_at ? new Date(row.created_at).getTime() : Date.now()));
  row._id = row.id;
  row.id = row.id;
  // Map snake_case DB columns to camelCase for frontend compatibility
  row.orderId = orderNum;
  row.order_id = orderNum;
  row.userId = row.user_id || row.userId;
  row.userName = row.user_name || row.userName;
  
  // Parse items if they come back as a string, otherwise use directly
  row.items = typeof row.items === 'string' ? JSON.parse(row.items) : row.items || [];
  
  row.discountCode = row.discount_code || row.discountCode;
  row.discountAmount = Number(row.discount_amount || row.discountAmount || 0);
  row.totalAmount = Number(row.total_amount || row.totalAmount || 0);
  row.createdAt = row.created_at || row.createdAt || new Date().toISOString();
  row.updatedAt = row.updated_at || row.updatedAt || row.createdAt;
  row.deliveredAt = row.delivered_at || row.deliveredAt || ((row.status === 'delivered' || row.status === 'completed') ? (row.updated_at || row.updatedAt) : null);

  // Expected delivery date: 2 business days after order creation (skipping Sunday)
  if (!row.expectedDeliveryDate && !row.expected_delivery_date) {
    const created = new Date(row.createdAt);
    const est = new Date(created);
    est.setDate(est.getDate() + 2);
    if (est.getDay() === 0) est.setDate(est.getDate() + 1);
    row.expectedDeliveryDate = est.toISOString();
  } else {
    row.expectedDeliveryDate = row.expected_delivery_date || row.expectedDeliveryDate;
  }

  return row;
}

function addIdAliasAll(rows) {
  return rows.map(addIdAlias);
}

const Order = {
  async find(query = {}) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return addIdAliasAll(data || []);
  },

  async findById(id) {
    const isNum = !isNaN(Number(id)) && Number.isInteger(Number(id));
    let query = supabase.from('orders').select('*');
    if (isNum) {
      query = query.eq('id', Number(id));
    } else {
      query = query.eq('order_id', id);
    }
    const { data, error } = await query.single();
    if (error && error.code !== 'PGRST116') throw error;
    return addIdAlias(data || null);
  },

  async findByUserId(userId) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return addIdAliasAll(data || []);
  },

  async create(data) {
    const orderId = data.orderId || ('ORD-' + Date.now());
    // Only set order_id - id is the serial integer primary key generated automatically by Postgres
    const insertData = {
      order_id: orderId,
      user_id: data.userId,
      user_name: data.userName,
      items: data.items || [],
      note: data.note || '',
      status: data.status || 'pending',
      discount_code: data.discountCode || null,
      discount_amount: data.discountAmount || 0,
      total_amount: data.totalAmount || 0,
    };

    const { data: result, error } = await supabase
      .from('orders')
      .insert([insertData])
      .select()
      .single();
      
    if (error) throw error;
    return addIdAlias(result);
  },

  async updateStatus(id, status) {
    const isNum = !isNaN(Number(id)) && Number.isInteger(Number(id));
    let query = supabase
      .from('orders')
      .update({ status: status, updated_at: new Date().toISOString() });
    if (isNum) {
      query = query.eq('id', Number(id));
    } else {
      query = query.eq('order_id', id);
    }
    const { data: result, error } = await query.select().single();
    if (error && error.code !== 'PGRST116') throw error;
    return addIdAlias(result || null);
  },

  async cancelOrder(id, role, userId) {
    const isNum = !isNaN(Number(id)) && Number.isInteger(Number(id));
    if (role === 'retailer') {
      let query = supabase
        .from('orders')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('status', 'pending');
      if (isNum) {
        query = query.eq('id', Number(id));
      } else {
        query = query.eq('order_id', id);
      }
      const { data: result, error } = await query.select().single();
      if (error && error.code !== 'PGRST116') throw error;
      if (!result) {
        throw new Error('Order not found or cannot be cancelled');
      }
      return addIdAlias(result);
    }
    
    if (role === 'admin') {
      let query = supabase
        .from('orders')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() });
      if (isNum) {
        query = query.eq('id', Number(id));
      } else {
        query = query.eq('order_id', id);
      }
      const { data: result, error } = await query.select().single();
      if (error && error.code !== 'PGRST116') throw error;
      if (!result) {
        throw new Error('Order not found');
      }
      return addIdAlias(result);
    }
    
    throw new Error('Unauthorized role for cancellation');
  },
};

module.exports = Order;
