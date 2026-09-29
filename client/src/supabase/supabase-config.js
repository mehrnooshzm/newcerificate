import { createClient } from '@supabase/supabase-js';

// Load Supabase environment variables (Vite-style, matching the old
const {
  VITE_SUPABASE_URL: supabaseUrl,
  VITE_SUPABASE_ANON_KEY: supabaseAnonKey,
} = import.meta.env;

// Single Supabase client — handles Auth, Database (Postgres), and Storage.
// uses one client for everything, so there's no separate "database" export.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
