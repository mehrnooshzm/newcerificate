import { supabase } from '@/supabase/supabase';

// Save (or update) a user's profile row in Supabase
export const saveUserProfile = async (user) => {
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id: user.id, // Supabase Auth user id (uuid)
      fullName: user.user_metadata?.full_name || '', // fallback empty string
      email: user.email,
      username: '', // Placeholder for username
      photoURL: user.user_metadata?.avatar_url || '', // fallback empty string
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};
