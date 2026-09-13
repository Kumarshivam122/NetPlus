import { setSessionCookie, getSessionCookie, clearSessionCookie } from '../utils/cookie';

// Use relative /api path in production (unified hosting), fallback to localhost in dev
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

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
    let licenceFileUrl = '';
    let shopPhotoUrl = '';

    if (formData.licenceFile && formData.licenceFile instanceof File) {
      licenceFileUrl = await apiUploadDocument(formData.licenceFile);
    } else if (formData.licenceFile && typeof formData.licenceFile === 'string') {
      licenceFileUrl = formData.licenceFile;
    }
    if (formData.shopPhoto && formData.shopPhoto instanceof File) {
      shopPhotoUrl = await apiUploadDocument(formData.shopPhoto);
    }

    const profileData = {
      ...formData,
      licenceFileUrl,
      shopPhotoUrl,
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
    return { success: false, error: err.message };
  }
}

// ==============================================================================
// 3. ORDERS SERVICES
// ==============================================================================

export async function apiGetOrders() {
  try {
    const orders = await fetchWithAuth('/orders');
    return (orders || []).map(o => ({ ...o, id: o._id }));
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function apiGetRetailerOrders(userId) {
  try {
    const orders = await fetchWithAuth('/orders/myorders');
    return (orders || []).map(o => ({ ...o, id: o._id }));
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function apiSubmitOrder(orderData) {
  try {
    const order = await fetchWithAuth('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    return order;
  } catch (err) {
    console.error(err);
    return null;
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
