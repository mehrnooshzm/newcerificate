import { supabase } from '../supabase/supabase-config';

// Function to get the current user's Supabase access token
// Authorization: Bearer <token> header when calling your backend API,
// which your authenticateUser middleware verifies via supabase.auth.getUser())
export const getToken = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) return null; // no signed-in user

  return session.access_token;
};
