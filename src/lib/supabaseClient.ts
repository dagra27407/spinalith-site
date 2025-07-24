import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ✅ Expose to DevTools only in dev mode
if (import.meta.env.DEV) {
  // @ts-ignore
  window.supabase = supabase;
}
