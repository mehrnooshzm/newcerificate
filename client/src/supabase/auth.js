import { supabase } from './supabase-config.js';
import { saveUserProfile } from '../services/userService.js';

/**
 * Create a new user with email and password
 * Also sets the display name (via user_metadata) and saves profile to backend
 */
export const doCreateUserWithEmailAndPassword = async (
  fullname,
  email,
  password
) => {

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullname,
      },
    },
  });

  if (error) throw error;

 
  await saveUserProfile(data.user);

  return data;
};

// Sign in existing user with email and password
export const doSignInWithEmailAndPassword = (email, password) => {
  return supabase.auth.signInWithPassword({ email, password });
};

// Sign out the currently logged-in user
export const doSignOut = () => {
  return supabase.auth.signOut();
};

// Resend the email confirmation link to the current/given email
// has no "currentUser" verification call; it resends a signup confirmation
// email instead, and needs the email explicitly)
export const doSendEmailVerification = async (email) => {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/`, // Redirect URL after verification
    },
  });

  if (error) throw error;
};
