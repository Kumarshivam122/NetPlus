// ==============================================================================
//   NET PLUS ENTERPRISES — Cookie & Local Session Persistence Manager
//   Provides resilient cookie + localStorage persistence for Admin & Retailer sessions
// ==============================================================================

const COOKIE_NAME = 'np_auth_session';
const STORAGE_KEY = 'np_auth';

export function setSessionCookie(user, days = 7) {
  if (!user) {
    clearSessionCookie();
    return;
  }
  try {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    const encoded = encodeURIComponent(JSON.stringify(user));
    document.cookie = `${COOKIE_NAME}=${encoded}; expires=${expires}; path=/; SameSite=Lax`;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch (e) {
    console.warn('Error saving session cookie:', e);
  }
}

export function getSessionCookie() {
  try {
    // 1. Check Cookie first
    const match = document.cookie.match(new RegExp('(^| )' + COOKIE_NAME + '=([^;]+)'));
    if (match && match[2]) {
      const decoded = decodeURIComponent(match[2]);
      const user = JSON.parse(decoded);
      if (user && user.email) return user;
    }
  } catch (e) {
    console.warn('Error reading cookie:', e);
  }

  // 2. Fallback to localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const user = JSON.parse(stored);
      if (user && user.email) {
        // Sync back to cookie
        setSessionCookie(user, 7);
        return user;
      }
    }
  } catch (e) {
    console.warn('Error reading localStorage:', e);
  }

  return null;
}

export function clearSessionCookie() {
  try {
    document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Error clearing session cookie:', e);
  }
}
