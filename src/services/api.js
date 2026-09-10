// ==============================================================================
//   NET PLUS ENTERPRISES — Unified API & Database Service Layer
//   Connects to Supabase PostgreSQL with hybrid sync & resilient fallback
// ==============================================================================

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { setSessionCookie, getSessionCookie, clearSessionCookie } from '../utils/cookie';
import {
  PRODUCTS as MOCK_PRODUCTS,
  getOrders as getMockOrders,
  submitOrder as submitMockOrder,
  updateOrderStatus as updateMockOrderStatus,
  getAllUsers as getMockUsers,
  updateUserStatus as updateMockUserStatus,
  deleteUser as deleteMockUser,
  login as mockLogin,
  register as mockRegister,
  logout as mockLogout,
  getAuth as getMockAuth
} from '../data/store';

export { isSupabaseConfigured };

// Helper to convert Snake Case (Postgres) to Camel Case (Frontend)
function normalizeProfile(p) {
  if (!p) return null;
  return {
    id: p.id,
    email: p.email,
    role: p.role || 'retailer',
    status: p.status || 'pending',
    storeName: p.store_name || p.storeName || '',
    storeType: p.store_type || p.storeType || '',
    licenceNo: p.licence_no || p.licenceNo || '',
    gstin: p.gstin || '',
    storeAddress: p.store_address || p.storeAddress || '',
    city: p.city || '',
    state: p.state || 'Maharashtra',
    pincode: p.pincode || '',
    ownerName: p.owner_name || p.ownerName || '',
    phone: p.phone || '',
    alternatePhone: p.alternate_phone || p.alternatePhone || '',
    licenceFileName: p.licence_file_name || p.licenceFileName || '',
    licenceFileUrl: p.licence_file_url || p.licenceFileUrl || '',
    shopPhotoName: p.shop_photo_name || p.shopPhotoName || '',
    shopPhotoUrl: p.shop_photo_url || p.shopPhotoUrl || '',
    registeredAt: p.created_at || p.registeredAt || new Date().toISOString(),
  };
}

function normalizeOrder(o) {
  if (!o) return null;
  return {
    id: o.id,
    userId: o.user_id || o.userId,
    userName: o.user_name || o.userName,
    productId: o.product_id || o.productId,
    productName: o.product_name || o.productName,
    manufacturer: o.manufacturer,
    unitPrice: Number(o.unit_price || o.unitPrice || 0),
    quantity: Number(o.quantity || 1),
    unit: o.unit || 'Strips',
    note: o.note || '',
    status: o.status || 'pending',
    submittedAt: o.submitted_at || o.submittedAt || new Date().toISOString(),
  };
}

// ==============================================================================
// 1. AUTHENTICATION SERVICES
// ==============================================================================

export async function apiSignIn(email, password) {
  const mockResult = mockLogin(email, password);
  const isAdmin = mockResult.success && mockResult.user?.role === 'admin';

  if (!isSupabaseConfigured()) {
    if (mockResult.success) setSessionCookie(mockResult.user);
    return mockResult;
  }

  // 1. If it's a fixed admin, skip Supabase Auth to avoid 400 error
  if (isAdmin) {
    setSessionCookie(mockResult.user);
    return mockResult;
  }

  // 2. For retailers, ATTEMPT Supabase Auth first so they get a JWT
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      // If they only exist locally, Supabase Auth will fail. Fallback to local session.
      if (mockResult.success) {
        setSessionCookie(mockResult.user);
        return mockResult;
      }
      return { success: false, error: authError.message };
    }

    // Supabase Auth Success
    const userId = authData.user?.id;
    const { data: profile } = await supabase
      .from('cust_detail')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profile) {
      const normalized = normalizeProfile(profile);
      setSessionCookie(normalized);
      return { success: true, user: normalized };
    }

    const meta = authData.user?.user_metadata || {};
    const fallbackUser = normalizeProfile({
      id: userId,
      email: authData.user?.email,
      role: meta.role || 'retailer',
      status: meta.status || 'pending',
      store_name: meta.store_name || meta.storeName,
      owner_name: meta.owner_name || meta.ownerName,
    });
    setSessionCookie(fallbackUser);
    return { success: true, user: fallbackUser };
  } catch (err) {
    if (mockResult.success) {
      setSessionCookie(mockResult.user);
      return mockResult;
    }
    return { success: false, error: err.message || 'Login failed' };
  }
}

export async function apiSimpleSignUp({ name, email, password }) {
  // Always save locally so the user is never lost
  const localFormData = {
    ownerName: name,
    storeName: '',
    email,
    password,
    phone: '',
    city: '',
  };
  const localResult = mockRegister(localFormData);

  if (!isSupabaseConfigured()) {
    if (localResult.success) setSessionCookie(localResult.user);
    return localResult;
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          owner_name: name,
          role: 'retailer',
          status: 'onboarding',
        }
      }
    });

    if (authError) throw authError;

    // Supabase trigger will auto-create the cust_detail row.
    // Return local result so the caller has a properly shaped user object.
    if (localResult.success) {
      setSessionCookie(localResult.user);
      return localResult;
    }

    // Fallback: build user from Supabase auth response
    const fallbackUser = normalizeProfile({
      id: authData.user?.id,
      email: authData.user?.email,
      role: 'retailer',
      status: 'onboarding',
      owner_name: name,
    });
    setSessionCookie(fallbackUser);
    return { success: true, user: fallbackUser };
  } catch (err) {
    console.error('Sign-up error:', err);
    // If Supabase fails but local worked, still let the user in
    if (localResult.success) {
      setSessionCookie(localResult.user);
      return localResult;
    }
    return { success: false, error: err.message };
  }
}

export async function apiSignUp(formData) {
  // Always save locally so new registrations are NEVER lost
  const localResult = mockRegister(formData);

  if (!isSupabaseConfigured()) {
    return localResult;
  }

  try {
    let licenceFileUrl = '';
    let shopPhotoUrl = '';

    if (formData.licenceFile && formData.licenceFile instanceof File) {
      licenceFileUrl = await apiUploadDocument(formData.licenceFile, `licences/${Date.now()}_${formData.licenceFileName}`);
    }
    if (formData.shopPhoto && formData.shopPhoto instanceof File) {
      shopPhotoUrl = await apiUploadDocument(formData.shopPhoto, `shops/${Date.now()}_${formData.shopPhotoName}`);
    }

    // Try signing up in Supabase Auth
    let supabaseUserId = null;
    try {
      const { data: authData } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            store_name: formData.storeName,
            store_type: formData.storeType,
            licence_no: formData.licenceNo,
            gstin: formData.gstin,
            store_address: formData.storeAddress,
            city: formData.city,
            state: formData.state || 'Maharashtra',
            pincode: formData.pincode,
            owner_name: formData.ownerName,
            phone: formData.phone,
            alternate_phone: formData.alternatePhone,
            licence_file_name: formData.licenceFileName,
            licence_file_url: licenceFileUrl,
            shop_photo_name: formData.shopPhotoName,
            shop_photo_url: shopPhotoUrl,
            role: 'retailer',
            status: 'pending',
          }
        }
      });
      supabaseUserId = authData?.user?.id;
    } catch (authErr) {
      console.warn('Supabase Auth signUp note:', authErr.message);
    }

    // Insert or update directly in public.profiles
    const profilePayload = {
      ...(supabaseUserId ? { id: supabaseUserId } : {}),
      email: formData.email,
      role: 'retailer',
      status: 'pending',
      store_name: formData.storeName,
      store_type: formData.storeType,
      licence_no: formData.licenceNo,
      gstin: formData.gstin,
      store_address: formData.storeAddress,
      city: formData.city,
      state: formData.state || 'Maharashtra',
      pincode: formData.pincode,
      owner_name: formData.ownerName,
      phone: formData.phone,
      alternate_phone: formData.alternatePhone,
      licence_file_name: formData.licenceFileName,
      licence_file_url: licenceFileUrl,
      shop_photo_name: formData.shopPhotoName,
      shop_photo_url: shopPhotoUrl,
    };

    try {
      await supabase.from('cust_detail').upsert(profilePayload);
    } catch (insertErr) {
      console.warn('Supabase direct profile insert warning:', insertErr.message);
    }

    return localResult;
  } catch (err) {
    console.error('Registration error:', err);
    return localResult;
  }
}

export async function apiSignOut() {
  clearSessionCookie();
  if (isSupabaseConfigured()) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase sign-out warning:', e);
    }
  }
  mockLogout();
}

export async function apiGetCurrentUser() {
  let saved = getSessionCookie() || getMockAuth();

  if (saved) {
    if (isSupabaseConfigured() && saved.role !== 'admin') {
      try {
        // Try cust_detail first, then profiles
        let profile = null;
        const { data: d1 } = await supabase
          .from('cust_detail')
          .select('*')
          .eq('email', saved.email)
          .maybeSingle();
        profile = d1;
        if (!profile) {
          const { data: d2 } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', saved.email)
            .maybeSingle();
          profile = d2;
        }
        if (profile) {
          saved = { ...saved, ...normalizeProfile(profile) };
          setSessionCookie(saved);
        }
      } catch (e) {
        console.warn('Silent profile sync failed:', e.message);
      }
    } else {
      const localUsers = getMockUsers() || [];
      const localMatch = localUsers.find(u => u.email === saved.email);
      if (localMatch && localMatch.status !== saved.status) {
        saved.status = localMatch.status;
        setSessionCookie(saved);
      }
    }
    return saved;
  }

  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const { data: profile } = await supabase
      .from('cust_detail')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profile) return normalizeProfile(profile);

    return normalizeProfile({
      id: session.user.id,
      email: session.user.email,
      ...session.user.user_metadata,
    });
  } catch (err) {
    console.warn('Get user session warning:', err.message);
    return null;
  }
}

// ==============================================================================
// 2. PRODUCT CATALOG SERVICES
// ==============================================================================

export async function apiGetProducts() {
  if (!isSupabaseConfigured()) {
    return MOCK_PRODUCTS;
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error || !data || data.length === 0) {
      return MOCK_PRODUCTS;
    }

    return data.map(p => ({
      id: p.id,
      name: p.name,
      generic: p.generic,
      manufacturer: p.manufacturer,
      category: p.category,
      price: Number(p.price),
      mrp: Number(p.mrp),
      unit: p.unit,
      stock: Number(p.stock),
      rx: Boolean(p.rx),
    }));
  } catch (err) {
    console.error('Error loading products:', err);
    return MOCK_PRODUCTS;
  }
}

export async function apiCreateProduct(productData) {
  const newProd = { ...productData, id: Date.now() };
  MOCK_PRODUCTS.push(newProd);

  if (!isSupabaseConfigured()) {
    return { success: true, product: newProd };
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .insert([{
        name: productData.name,
        generic: productData.generic,
        manufacturer: productData.manufacturer,
        category: productData.category,
        price: productData.price,
        mrp: productData.mrp,
        unit: productData.unit,
        stock: productData.stock,
        rx: productData.rx,
      }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, product: data };
  } catch (err) {
    console.error('Error adding product to Supabase (added locally):', err);
    return { success: true, product: newProd };
  }
}

export async function apiDeleteProduct(productId) {
  const idx = MOCK_PRODUCTS.findIndex(p => p.id === productId);
  if (idx !== -1) MOCK_PRODUCTS.splice(idx, 1);

  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    await supabase.from('products').delete().eq('id', productId);
    return { success: true };
  } catch (err) {
    console.error('Error deleting product:', err);
    return { success: true };
  }
}

// ==============================================================================
// 3. ORDERS SERVICES
// ==============================================================================

export async function apiGetOrders() {
  const localOrders = getMockOrders() || [];
  if (!isSupabaseConfigured()) {
    return localOrders;
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      return localOrders;
    }

    const supabaseOrders = (data || []).map(normalizeOrder);
    const idSet = new Set(supabaseOrders.map(o => o.id));
    const merged = [...supabaseOrders];
    for (const o of localOrders) {
      if (o.id && !idSet.has(o.id)) {
        merged.push(o);
      }
    }
    return merged;
  } catch (err) {
    console.error('Error loading orders:', err);
    return localOrders;
  }
}

export async function apiGetRetailerOrders(userId) {
  const localOrders = (getMockOrders() || []).filter(o => o.userId === userId);
  if (!isSupabaseConfigured()) {
    return localOrders;
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false });

    if (error) {
      return localOrders;
    }

    const supabaseOrders = (data || []).map(normalizeOrder);
    const idSet = new Set(supabaseOrders.map(o => o.id));
    const merged = [...supabaseOrders];
    for (const o of localOrders) {
      if (o.id && !idSet.has(o.id)) {
        merged.push(o);
      }
    }
    return merged;
  } catch (err) {
    console.error('Error loading retailer orders:', err);
    return localOrders;
  }
}

export async function apiSubmitOrder(orderData) {
  const localEntry = submitMockOrder(orderData);

  if (!isSupabaseConfigured()) {
    return localEntry;
  }

  try {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(orderData.userId);
    const numProductId = Number(orderData.productId);
    const isValidProductId = !isNaN(numProductId) && numProductId > 0;
    
    const orderId = localEntry.id || ('ORD-' + Date.now());
    const payload = {
      id: orderId,
      user_id: isUUID ? orderData.userId : null,
      user_name: orderData.userName,
      product_id: isValidProductId ? numProductId : null,
      product_name: orderData.productName,
      manufacturer: orderData.manufacturer,
      unit_price: orderData.unitPrice,
      quantity: orderData.quantity,
      unit: orderData.unit || 'Strips',
      note: orderData.note || '',
      status: 'pending',
      submitted_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('orders')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.warn('Supabase order insert notice (persisted locally):', error.message);
      return localEntry;
    }

    return normalizeOrder(data);
  } catch (err) {
    console.error('Error submitting order to Supabase:', err);
    return localEntry;
  }
}

export async function apiUpdateOrderStatus(orderId, status) {
  updateMockOrderStatus(orderId, status);

  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    await supabase.from('orders').update({ status }).eq('id', orderId);
    return { success: true };
  } catch (err) {
    console.error('Error updating order status in Supabase:', err);
    return { success: true };
  }
}

// ==============================================================================
// 4. RETAILER PROFILES MANAGEMENT (Admin)
// ==============================================================================

export async function apiGetAllUsers() {
  const localUsers = getMockUsers() || [];

  if (!isSupabaseConfigured()) {
    return localUsers;
  }

  try {
    let supabaseUsers = [];

    // Try cust_detail first (new table name)
    try {
      const { data: d1, error: e1 } = await supabase
        .from('cust_detail')
        .select('*')
        .order('created_at', { ascending: false });
      if (!e1 && d1 && d1.length > 0) {
        supabaseUsers = d1.map(normalizeProfile);
      }
    } catch (e) { /* silent */ }

    // Also try profiles (old table name) in case data hasn't been migrated
    if (supabaseUsers.length === 0) {
      try {
        const { data: d2, error: e2 } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        if (!e2 && d2 && d2.length > 0) {
          supabaseUsers = d2.map(normalizeProfile);
        }
      } catch (e) { /* silent */ }
    }

    // Merge: Supabase data takes priority, but include local-only users too
    const emailMap = new Map();

    for (const s of supabaseUsers) {
      if (s.email) emailMap.set(s.email.toLowerCase(), s);
    }

    for (const l of localUsers) {
      if (!l.email) continue;
      const key = l.email.toLowerCase();
      if (!emailMap.has(key)) {
        emailMap.set(key, l);
      }
    }

    return Array.from(emailMap.values());
  } catch (err) {
    console.error('Error loading users:', err);
    return localUsers;
  }
}

export async function apiUpdateUserStatus(userId, status) {
  updateMockUserStatus(userId, status);

  if (!isSupabaseConfigured()) {
    return true;
  }

  // Find the user's email from local storage for fallback
  const localUsers = getMockUsers() || [];
  const localUser = localUsers.find(u => u.id === userId);
  const userEmail = localUser?.email;

  const updatePayload = { status, updated_at: new Date().toISOString() };

  try {
    // Try cust_detail by id
    await supabase.from('cust_detail').update(updatePayload).eq('id', userId);
    // Also try by email on cust_detail
    if (userEmail) {
      await supabase.from('cust_detail').update(updatePayload).eq('email', userEmail);
    }
    // Also try profiles (old table) by id and email
    await supabase.from('profiles').update(updatePayload).eq('id', userId);
    if (userEmail) {
      await supabase.from('profiles').update(updatePayload).eq('email', userEmail);
    }
    return true;
  } catch (err) {
    console.error('Error updating user status in Supabase:', err);
    return true;
  }
}

export async function apiUpdateProfile(userId, profileData) {
  if (!isSupabaseConfigured()) {
    return true; // handled by store.js normally, but we keep it simple
  }
  try {
    const { error } = await supabase.from('cust_detail').update(profileData).eq('id', userId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error updating profile:', err);
    return false;
  }
}

export async function apiSubmitOnboarding(userId, email, data) {
  // Update local user status to 'pending'
  updateMockUserStatus(userId, 'pending');

  // Update the session cookie with the new data
  const currentAuth = getSessionCookie() || getMockAuth();
  if (currentAuth && currentAuth.email === email) {
    const updated = { ...currentAuth, ...data, status: 'pending' };
    setSessionCookie(updated);
  }

  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    // Try updating by user id first
    const { data: updateData, error } = await supabase
      .from('cust_detail')
      .update({
        store_name: data.storeName,
        store_address: data.storeAddress,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        phone: data.phone,
        alternate_phone: data.alternatePhone,
        licence_no: data.licenceNo,
        licence_file_url: data.licenceFile,
        status: 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    // If update by id matched nothing (local-only user), try by email
    if (error || (updateData && updateData.length === 0)) {
      const { error: emailError } = await supabase
        .from('cust_detail')
        .update({
          store_name: data.storeName,
          store_address: data.storeAddress,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          phone: data.phone,
          alternate_phone: data.alternatePhone,
          licence_no: data.licenceNo,
          licence_file_url: data.licenceFile,
          status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('email', email);

      if (emailError) {
        console.warn('Onboarding update by email also failed:', emailError.message);
      }
    }

    return { success: true };
  } catch (err) {
    console.error('Error submitting onboarding details:', err);
    // Still return success since local storage was updated
    return { success: true };
  }
}

export async function apiDeleteUser(userId) {
  deleteMockUser(userId);

  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    await supabase.from('cust_detail').delete().eq('id', userId);
    return { success: true };
  } catch (err) {
    console.error('Error deleting user in Supabase:', err);
    return { success: true };
  }
}

// ==============================================================================
// 5. STORAGE / DOCUMENT UPLOADS
// ==============================================================================

export async function apiUploadDocument(file, path) {
  if (!isSupabaseConfigured() || !file) {
    return '';
  }

  try {
    const { error } = await supabase.storage
      .from('retailer-documents')
      .upload(path, file, { upsert: true });

    if (error) throw error;

    const { data } = supabase.storage
      .from('retailer-documents')
      .getPublicUrl(path);

    return data?.publicUrl || '';
  } catch (err) {
    console.warn('File upload notice:', err.message);
    return '';
  }
}
