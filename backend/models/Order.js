const supabase = require('../db/supabase');

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
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return addIdAliasAll(data || []);
  },

  async findById(id) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
      
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
    const insertData = {
      order_id: data.orderId || 'ORD-' + Date.now(),
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
    const { data: result, error } = await supabase
      .from('orders')
      .update({ status: status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
      
    if (error && error.code !== 'PGRST116') throw error;
    return addIdAlias(result || null);
  },

  async cancelOrder(id, role, userId) {
    if (role === 'retailer') {
      const { data: result, error } = await supabase
        .from('orders')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId)
        .eq('status', 'pending')
        .select()
        .single();
        
      if (error && error.code !== 'PGRST116') throw error;
      if (!result) {
        throw new Error('Order not found or cannot be cancelled');
      }
      return addIdAlias(result);
    }
    
    if (role === 'admin') {
      const { data: result, error } = await supabase
        .from('orders')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
        
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
