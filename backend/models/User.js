const supabase = require('../db/supabase');
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
    licenceFile2Name: row.licence_file2_name,
    licenceFile2Url: row.licence_file2_url,
    gstinFileName: row.gstin_file_name,
    gstinFileUrl: row.gstin_file_url,
    shopPhotoName: row.shop_photo_name,
    shopPhotoUrl: row.shop_photo_url,
    resetOtp: row.reset_otp,
    resetOtpExpiry: row.reset_otp_expiry,
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
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', query.email)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error;
      return formatUser(data || null);
    }
    return null;
  },

  async findById(id, options = {}) {
    const cols = options.excludePassword
      ? 'id, name, email, role, status, store_name, store_type, licence_no, gstin, store_address, city, state, pincode, owner_name, phone, alternate_phone, licence_file_name, licence_file_url, licence_file2_name, licence_file2_url, gstin_file_name, gstin_file_url, shop_photo_name, shop_photo_url, created_at, updated_at'
      : '*';
      
    const { data, error } = await supabase
      .from('users')
      .select(cols)
      .eq('id', id)
      .single();
      
    if (error && error.code !== 'PGRST116') throw error;
    return formatUser(data || null);
  },

  async find(query = {}, options = {}) {
    const cols = options.excludePassword
      ? 'id, name, email, role, status, store_name, store_type, licence_no, gstin, store_address, city, state, pincode, owner_name, phone, alternate_phone, licence_file_name, licence_file_url, licence_file2_name, licence_file2_url, gstin_file_name, gstin_file_url, shop_photo_name, shop_photo_url, created_at, updated_at'
      : '*';
      
    const { data, error } = await supabase
      .from('users')
      .select(cols)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return formatUsers(data || []);
  },

  async create(data) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const { data: result, error } = await supabase
      .from('users')
      .insert([{
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role || 'retailer',
        status: data.status || 'onboarding',
      }])
      .select()
      .single();
      
    if (error) throw error;
    return formatUser(result);
  },

  async update(id, data) {
    const allowedFields = [
      'name', 'email', 'role', 'status',
      'store_name', 'store_type', 'licence_no', 'gstin',
      'store_address', 'city', 'state', 'pincode',
      'owner_name', 'phone', 'alternate_phone',
      'licence_file_name', 'licence_file_url',
      'licence_file2_name', 'licence_file2_url',
      'gstin_file_name', 'gstin_file_url',
      'shop_photo_name', 'shop_photo_url'
    ];

    const keyMap = {
      storeName: 'store_name',
      storeType: 'store_type',
      licenceNo: 'licence_no',
      storeAddress: 'store_address',
      ownerName: 'owner_name',
      alternatePhone: 'alternate_phone',
      licenceFileName: 'licence_file_name',
      licenceFileUrl: 'licence_file_url',
      licenceFile2Name: 'licence_file2_name',
      licenceFile2Url: 'licence_file2_url',
      gstinFileName: 'gstin_file_name',
      gstinFileUrl: 'gstin_file_url',
      shopPhotoName: 'shop_photo_name',
      shopPhotoUrl: 'shop_photo_url'
    };

    const updateData = {};
    for (const [key, val] of Object.entries(data)) {
      if (val === undefined) continue;
      const dbCol = keyMap[key] || key;
      if (!allowedFields.includes(dbCol)) continue;
      updateData[dbCol] = val;
    }

    if (Object.keys(updateData).length === 0) {
      return this.findById(id);
    }

    const { data: result, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error && error.code !== 'PGRST116') throw error;
    
    const updatedUser = result || null;

    // Synchronize retailer details with cust_details table
    if (updatedUser && updatedUser.role === 'retailer') {
      try {
        await supabase
          .from('cust_details')
          .upsert({
            user_id: updatedUser.id,
            store_name: updatedUser.store_name || '—',
            owner_name: updatedUser.owner_name || '—',
            phone: updatedUser.phone || '—',
            email: updatedUser.email || '—',
            city: updatedUser.city,
            state: updatedUser.state,
            pincode: updatedUser.pincode,
            gstin: updatedUser.gstin,
            licence_no: updatedUser.licence_no
          }, { onConflict: 'user_id' });
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
    const { error, count } = await supabase
      .from('users')
      .delete({ count: 'exact' })
      .eq('id', id);
      
    if (error) throw error;
    return count > 0;
  },

  async saveOtp(email, otp, expiry) {
    const { error } = await supabase
      .from('users')
      .update({ reset_otp: otp, reset_otp_expiry: expiry })
      .eq('email', email);
      
    if (error) throw error;
  },

  async clearOtp(email) {
    const { error } = await supabase
      .from('users')
      .update({ reset_otp: null, reset_otp_expiry: null })
      .eq('email', email);
      
    if (error) throw error;
  },

  async updatePassword(email, newPassword) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    const { error } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('email', email);
      
    if (error) throw error;
  }
};

module.exports = User;
