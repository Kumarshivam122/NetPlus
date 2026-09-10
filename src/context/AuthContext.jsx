import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { apiGetCurrentUser, apiSignOut } from '../services/api';
import { getSessionCookie, setSessionCookie, clearSessionCookie } from '../utils/cookie';

const defaultContext = {
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  refreshUser: () => {},
  isSupabase: false,
};

const AuthContext = createContext(defaultContext);

export function AuthProvider({ children }) {
  // Synchronously initialize user from Cookie / localStorage to prevent flicker or logout on refresh
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
        const saved = getSessionCookie();
        if (saved && mounted) {
          setUser(saved);
          setLoading(false);
          return;
        }

        const initialUser = await apiGetCurrentUser();
        if (mounted && initialUser) {
          setSessionCookie(initialUser);
          setUser(initialUser);
        }
      } catch (err) {
        console.warn('Auth init note:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    // If Supabase is configured, listen to auth state changes
    let subscription = null;
    if (isSupabaseConfigured()) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;

        // Only clear user on explicit sign out
        if (event === 'SIGNED_OUT') {
          clearSessionCookie();
          setUser(null);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          if (session?.user) {
            const freshUser = await apiGetCurrentUser();
            if (mounted && freshUser) {
              setSessionCookie(freshUser);
              setUser(freshUser);
            }
          }
        }
      });
      subscription = data?.subscription;
    }

    return () => {
      mounted = false;
      if (subscription) subscription.unsubscribe();
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
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, isSupabase: isSupabaseConfigured() }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  return context || defaultContext;
}
