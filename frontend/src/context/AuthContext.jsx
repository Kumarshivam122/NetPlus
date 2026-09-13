import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiGetCurrentUser, apiSignOut } from '../services/api';
import { getSessionCookie, setSessionCookie, clearSessionCookie } from '../utils/cookie';

const defaultContext = {
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  refreshUser: () => {},
};

const AuthContext = createContext(defaultContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getSessionCookie());
  const [loading, setLoading] = useState(() => !getSessionCookie());

  const refreshUser = useCallback(async () => {
    try {
      const current = await apiGetCurrentUser();
      if (current) {
        setSessionCookie(current);
        setUser(current);
      }
    } catch (e) {
      console.warn('Error refreshing user session:', e);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const initialUser = await apiGetCurrentUser();
        if (mounted && initialUser) {
          setSessionCookie(initialUser);
          setUser(initialUser);
        } else if (mounted) {
          clearSessionCookie();
          setUser(null);
        }

      } catch (err) {
        console.warn('Auth init note:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback((userData) => {
    setSessionCookie(userData);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    clearSessionCookie();
    await apiSignOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  return context || defaultContext;
}
