const supabase = require('../db/supabase');

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
    let q = supabase.from('coupons').select('*');

    if (query.isActive !== undefined) {
      q = q.eq('is_active', query.isActive);
    }
    if (query.isVisible !== undefined) {
      q = q.eq('is_visible', query.isVisible);
    }

    const { data, error } = await q.order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(formatCoupon);
  },

  async findByCode(code) {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code)
      .single();
    
    // Supabase .single() throws PGRST116 if no rows found
    if (error && error.code !== 'PGRST116') throw error;
    return formatCoupon(data || null);
  },

  async create(data) {
    const { data: result, error } = await supabase
      .from('coupons')
      .insert([{
        code: data.code,
        discount_percentage: data.discountPercentage,
        is_active: data.isActive !== false,
        is_visible: data.isVisible !== false
      }])
      .select()
      .single();
      
    if (error) throw error;
    return formatCoupon(result);
  },

  async update(id, data) {
    const updateData = {};

    if (data.code !== undefined) updateData.code = data.code;
    if (data.discountPercentage !== undefined) updateData.discount_percentage = data.discountPercentage;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;
    if (data.isVisible !== undefined) updateData.is_visible = data.isVisible;

    if (Object.keys(updateData).length === 0) return null;
    updateData.updated_at = new Date().toISOString();

    const { data: result, error } = await supabase
      .from('coupons')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error && error.code !== 'PGRST116') throw error;
    return formatCoupon(result || null);
  },

  async delete(id) {
    const { error, count } = await supabase
      .from('coupons')
      .delete({ count: 'exact' })
      .eq('id', id);
      
    if (error) throw error;
    return count > 0;
  }
};

module.exports = Coupon;
