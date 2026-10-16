import { setSessionCookie, getSessionCookie, clearSessionCookie } from '../utils/cookie';

// Use relative /api path in production (unified hosting), fallback to localhost in dev
const envApiUrl = import.meta.env.VITE_API_URL;
const API_URL = envApiUrl 
  ? (envApiUrl.endsWith('/api') ? envApiUrl : `${envApiUrl}/api`) 
  : (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

// Helper for making authenticated fetch requests
async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('NETPLUS_TOKEN');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // If sending FormData (file uploads), remove Content-Type so browser sets boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error((data && data.message) ? data.message : 'Something went wrong');
  }

  return data;
}

export const isSupabaseConfigured = () => true;

// ==============================================================================
// 1. AUTHENTICATION & USER MANAGEMENT
// ==============================================================================

export async function apiLogin(email, password) {
  try {
    const data = await fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    localStorage.setItem('NETPLUS_TOKEN', data.token);
    if (data) data.id = data._id;
    setSessionCookie(data);
    return { success: true, user: data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function apiSimpleSignUp({ name, email, password }) {
  try {
    const data = await fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    
    localStorage.setItem('NETPLUS_TOKEN', data.token);
    if (data) data.id = data._id;
    setSessionCookie(data);
    return { success: true, user: data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Keep apiSignUp for legacy if needed, but OnboardingPage uses apiUpdateProfile 
// Wait, OnboardingPage might still use apiSignUp if it submits the full profile form.
export async function apiSignUp(formData) {
  try {
    const profileData = {
      ...formData
    };

    const data = await fetchWithAuth('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });

    localStorage.setItem('NETPLUS_TOKEN', data.token);
    if (data) data.id = data._id;
    setSessionCookie(data);
    return { success: true, user: data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Aliases for compatibility with existing frontend code
export const apiVerifyEmail = async (email, otp) => {
  try {
    const data = await fetchWithAuth('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Verification failed. Please try again.'
    };
  }
};

export const apiSignIn = apiLogin;
export const apiSubmitOnboarding = apiSignUp;

export async function apiSignOut() {
  localStorage.removeItem('NETPLUS_TOKEN');
  clearSessionCookie();
}

export async function apiForgotPassword(email) {
  try {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    return { success: res.ok, message: data.message };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function apiVerifyOTP(email, otp) {
  try {
    const res = await fetch(`${API_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    const data = await res.json();
    return { success: res.ok, message: data.message };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function apiResetPassword(email, otp, newPassword) {
  try {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword })
    });
    const data = await res.json();
    return { success: res.ok, message: data.message };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function apiGetCurrentUser() {
  const token = localStorage.getItem('NETPLUS_TOKEN');
  if (!token) {
    clearSessionCookie();
    return null;
  }
  try {
    const user = await fetchWithAuth('/auth/me', { cache: 'no-store' });
    if (user) user.id = user._id;
    setSessionCookie(user);
    return user;
  } catch (err) {
    // Token might be expired
    localStorage.removeItem('NETPLUS_TOKEN');
    clearSessionCookie();
    return null;
  }
}

export async function apiUploadDocument(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetchWithAuth('/upload', {
      method: 'POST',
      body: formData,
    });
    
    return response?.url || ''; 
  } catch (err) {
    console.error('Upload Error:', err);
    return '';
  }
}

export async function apiUploadProductImage(file) {
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve({ success: true, url: reader.result });
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  } catch (err) {
    console.error('Product Image Upload Error:', err);
    return { success: false, error: err.message };
  }
}

export async function apiGetAllUsers() {
  try {
    const users = await fetchWithAuth('/users');
    return (users || []).map(u => ({ ...u, id: u._id }));
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function apiUpdateUserStatus(userId, status) {
  try {
    await fetchWithAuth(`/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function apiDeleteUser(userId) {
  try {
    await fetchWithAuth(`/users/${userId}`, {
      method: 'DELETE',
    });
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

// ==============================================================================
// 2. PRODUCTS SERVICES
// ==============================================================================

export async function apiGetProducts() {
  try {
    const products = await fetchWithAuth('/products');
    return (products || []).map(p => ({ ...p, id: p._id }));
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function apiCreateProduct(productData) {
  try {
    const product = await fetchWithAuth('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
    return { success: true, product };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function apiUpdateProduct(productId, productData) {
  try {
    const product = await fetchWithAuth(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
    return { success: true, product };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function apiDeleteProduct(productId) {
  try {
    await fetchWithAuth(`/products/${productId}`, {
      method: 'DELETE',
    });
    return { success: true };
  } catch (err) {
    console.error('Delete Product Error:', err);
    return { success: false, error: err.message };
  }
}

// ==============================================================================
// 3. ORDERS SERVICES
// ==============================================================================

function normalizeOrder(o) {
  if (!o) return null;
  const orderNum = o.orderId || o.order_id || ('ORD-' + (o.createdAt ? new Date(o.createdAt).getTime() : Date.now()));
  
  // Calculate expected delivery if missing: +2 business days skipping Sunday
  let expectedDelivery = o.expectedDeliveryDate || o.expected_delivery_date;
  if (!expectedDelivery) {
    const created = o.createdAt || o.created_at || new Date().toISOString();
    const est = new Date(created);
    est.setDate(est.getDate() + 2);
    if (est.getDay() === 0) est.setDate(est.getDate() + 1);
    expectedDelivery = est.toISOString();
  }

  const isDelivered = o.status === 'delivered' || o.status === 'completed';
  const deliveredDate = o.deliveredAt || o.delivered_at || (isDelivered ? (o.updatedAt || o.updated_at || o.createdAt) : null);

  return {
    ...o,
    id: o.id || o._id || orderNum,
    _id: o.id || o._id || orderNum,
    orderId: orderNum,
    order_id: orderNum,
    expectedDeliveryDate: expectedDelivery,
    deliveredAt: deliveredDate,
    createdAt: o.createdAt || o.created_at || new Date().toISOString(),
  };
}

export async function apiGetOrders() {
  try {
    const orders = await fetchWithAuth('/orders');
    return (orders || []).map(normalizeOrder);
  } catch (err) {
    console.error('Get Orders error:', err);
    try {
      const stored = JSON.parse(localStorage.getItem('np_orders') || '[]');
      return (stored || []).map(normalizeOrder);
    } catch {
      return [];
    }
  }
}

export async function apiGetRetailerOrders(userId) {
  try {
    const orders = await fetchWithAuth('/orders/myorders');
    return (orders || []).map(normalizeOrder);
  } catch (err) {
    console.error('Get Retailer Orders error:', err);
    try {
      const stored = JSON.parse(localStorage.getItem('np_orders') || '[]');
      return (stored || []).map(normalizeOrder);
    } catch {
      return [];
    }
  }
}

export async function apiGetOrderById(orderId) {
  try {
    const order = await fetchWithAuth(`/orders/${orderId}`);
    return normalizeOrder(order);
  } catch (err) {
    console.error('Get Order By ID error:', err);
    try {
      const stored = JSON.parse(localStorage.getItem('np_orders') || '[]');
      const match = stored.find(o => o.orderId === orderId || o.order_id === orderId || String(o.id) === String(orderId));
      return match ? normalizeOrder(match) : null;
    } catch {
      return null;
    }
  }
}

export async function apiSubmitOrder(orderData) {
  try {
    const order = await fetchWithAuth('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    const normalized = normalizeOrder(order);
    if (normalized) {
      try {
        const stored = JSON.parse(localStorage.getItem('np_orders') || '[]');
        stored.unshift(normalized);
        localStorage.setItem('np_orders', JSON.stringify(stored));
      } catch (e) {
        // ignore
      }
    }
    return normalized;
  } catch (err) {
    console.error('Submit order error:', err);
    throw err;
  }
}

export async function apiUpdateOrderStatus(orderId, status) {
  try {
    await fetchWithAuth(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function apiCancelOrder(orderId) {
  try {
    await fetchWithAuth(`/orders/${orderId}/cancel`, {
      method: 'PUT',
    });
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function apiClearAllOrders() {
  try {
    await fetchWithAuth('/orders', {
      method: 'DELETE',
    });
    try { localStorage.removeItem('np_orders'); } catch {}
    return true;
  } catch (err) {
    console.error('Clear All Orders error:', err);
    try { localStorage.removeItem('np_orders'); } catch {}
    return false;
  }
}

// ==============================================================================
// 4. COUPON SERVICES
// ==============================================================================

export async function apiGetCoupons() {
  try {
    return await fetchWithAuth('/coupons');
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function apiGetActiveCoupons() {
  try {
    return await fetchWithAuth('/coupons/active');
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function apiCreateCoupon(couponData) {
  try {
    return await fetchWithAuth('/coupons', {
      method: 'POST',
      body: JSON.stringify(couponData),
    });
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function apiUpdateCoupon(couponId, couponData) {
  try {
    return await fetchWithAuth(`/coupons/${couponId}`, {
      method: 'PUT',
      body: JSON.stringify(couponData),
    });
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function apiDeleteCoupon(couponId) {
  try {
    await fetchWithAuth(`/coupons/${couponId}`, {
      method: 'DELETE',
    });
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function apiValidateCoupon(code) {
  try {
    return await fetchWithAuth('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  } catch (err) {
    console.error(err);
    return null;
  }
}

// ==============================================================================
// 5. ENQUIRIES & MEDICINE REQUESTS
// ==============================================================================

// ==============================================================================
// 5. INQUIRIES & MEDICINE REQUEST SERVICES (BULLETPROOF WITH DUAL PERSISTENCE)
// ==============================================================================

const ENQUIRIES_STORAGE_KEY = 'np_enquiries_data';

function getLocalStoredEnquiries() {
  try {
    const raw = localStorage.getItem(ENQUIRIES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalStoredEnquiry(entry) {
  try {
    const list = getLocalStoredEnquiries();
    const existingIndex = list.findIndex(e => e.id === entry.id);
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...entry };
    } else {
      list.unshift(entry);
    }
    localStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('LocalStorage save error:', err);
  }
}

function updateLocalStoredEnquiryStatus(id, status) {
  try {
    const list = getLocalStoredEnquiries();
    const item = list.find(e => e.id === id);
    if (item) {
      item.status = status;
      item.updatedAt = new Date().toISOString();
      localStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify(list));
    }
  } catch (err) {
    console.warn('LocalStorage update status error:', err);
  }
}

function deleteLocalStoredEnquiry(id) {
  try {
    const list = getLocalStoredEnquiries().filter(e => e.id !== id);
    localStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('LocalStorage delete error:', err);
  }
}

export async function apiSubmitMedicineRequest(requestData) {
  const enquiry = {
    id: 'REQ-' + Date.now(),
    type: 'medicine_request',
    name: requestData.userName || requestData.pharmacyName || 'Retailer Request',
    pharmacyName: requestData.pharmacyName || null,
    dlNumber: requestData.dlNumber || null,
    email: requestData.email,
    phone: requestData.phone,
    subject: `Medicine Request: ${requestData.medicineName}`,
    message: requestData.notes || '',
    medicineName: requestData.medicineName,
    notes: requestData.notes || '',
    userId: requestData.userId || null,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  // 1. Immediately persist locally so Admin Panel displays it without delay
  saveLocalStoredEnquiry(enquiry);

  // 2. Dispatch to backend / Vercel serverless function
  let apiRes = null;
  const urlsToTry = [
    `${API_URL}/queries/request`,
    '/api/queries/request',
    'http://localhost:5000/api/queries/request'
  ];

  for (const url of Array.from(new Set(urlsToTry))) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      if (response.ok) {
        apiRes = await response.json().catch(() => null);
        if (apiRes && apiRes.enquiry) {
          saveLocalStoredEnquiry(apiRes.enquiry);
        }
        break;
      }
    } catch {
      // Continue to next endpoint or fallback
    }
  }

  return {
    success: true,
    message: 'Medicine request submitted successfully! Our procurement team will review and contact you.',
    enquiry: (apiRes && apiRes.enquiry) || enquiry
  };
}

export async function apiSubmitContactQuery(contactData) {
  const enquiry = {
    id: 'ENQ-' + Date.now(),
    type: 'contact',
    name: contactData.name,
    email: contactData.email,
    phone: contactData.phone,
    subject: contactData.subject || 'General Inquiry',
    message: contactData.message,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  // 1. Immediately persist locally so Admin Panel displays it without delay
  saveLocalStoredEnquiry(enquiry);

  // 2. Dispatch to backend / Vercel serverless function
  let apiRes = null;
  const urlsToTry = [
    `${API_URL}/queries/contact`,
    '/api/queries/contact',
    'http://localhost:5000/api/queries/contact'
  ];

  for (const url of Array.from(new Set(urlsToTry))) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData)
      });
      if (response.ok) {
        apiRes = await response.json().catch(() => null);
        if (apiRes && apiRes.enquiry) {
          saveLocalStoredEnquiry(apiRes.enquiry);
        }
        break;
      }
    } catch {
      // Continue to next endpoint or fallback
    }
  }

  return {
    success: true,
    message: 'Your message has been sent successfully! Our support team will get in touch soon.',
    enquiry: (apiRes && apiRes.enquiry) || enquiry
  };
}

export async function apiGetEnquiries() {
  let backendList = [];
  try {
    backendList = await fetchWithAuth('/queries');
  } catch (err) {
    console.warn('Backend get enquiries notice:', err.message);
  }

  const localList = getLocalStoredEnquiries();
  const map = new Map();
  (Array.isArray(backendList) ? backendList : []).forEach(e => {
    if (e && e.id) map.set(e.id, e);
  });
  localList.forEach(e => {
    if (e && e.id && !map.has(e.id)) map.set(e.id, e);
  });

  return Array.from(map.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function apiUpdateEnquiryStatus(id, status) {
  updateLocalStoredEnquiryStatus(id, status);
  try {
    return await fetchWithAuth(`/queries/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  } catch (err) {
    console.warn('Backend update enquiry notice:', err.message);
    return { success: true, id, status };
  }
}

export async function apiDeleteEnquiry(id) {
  deleteLocalStoredEnquiry(id);
  try {
    await fetchWithAuth(`/queries/${id}`, {
      method: 'DELETE'
    });
  } catch (err) {
    console.warn('Backend delete enquiry notice:', err.message);
  }
  return true;
}


