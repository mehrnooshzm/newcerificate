import { createClient } from '@supabase/supabase-js';

// Supabase project URL and anonymous key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY;

// Create a Supabase client instance for interacting with the database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
