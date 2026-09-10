import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('your-project-ref') &&
    !supabaseUrl.includes('placeholder')
  );
};

// Singleton instance to prevent multiple GoTrueClient warnings during hot reloading
let supabaseInstance = null;

if (!supabaseInstance) {
  if (isSupabaseConfigured()) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
  } else {
    supabaseInstance = createClient('https://placeholder.supabase.co', 'placeholder-anon-key');
  }
}

export const supabase = supabaseInstance;
export default supabase;
