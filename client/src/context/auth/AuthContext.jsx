import { useEffect, useState, createContext } from 'react';
import { supabase } from '@/supabase/supabase-config';

// Context to share authentication state across the app
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // State for current user and related info
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isEmailUser, setIsEmailUser] = useState(false);
  const [loading, setLoading] = useState(true);

  // Set up Supabase auth listener on mount
  useEffect(() => {
    // Check the current session once on load (onAuthStateChange alone
    // doesn't always fire immediately with the existing session on mount)
    supabase.auth.getSession().then(({ data: { session } }) => {
      initializeUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      initializeUser(session?.user ?? null); // Initialize user state when auth changes
    });

    return () => subscription.unsubscribe(); // Clean up listener on unmount
  }, []);

  // Initialize user data from Supabase auth and database
  async function initializeUser(user) {
    if (user) {
      setCurrentUser(user);

    
      // Email/password users have 'email' in their identities' provider list.
      const isEmail = (user.identities || []).some(
        (identity) => identity.provider === 'email'
      );

      setIsEmailUser(isEmail);
      setUserLoggedIn(true);

      try {
      
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setUserData(data); // Set user profile data
        } else {
          console.log('No user profile data found.');
          setUserData(null);
        }

        setUserLoggedIn(true);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserData(null);
      }
    } else {
      // Reset state if no user is logged in
      setCurrentUser(null);
      setUserData(null);
      setUserLoggedIn(false);
      setIsEmailUser(false);
    }
    setLoading(false); // Finished loading
  }

  return (
    <AuthContext
      value={{
        currentUser,
        setCurrentUser,
        userLoggedIn,
        isEmailUser,
        userData,
        setUserData,
        loading,
      }}
    >
      {!loading && children} {/* Render children only after loading */}
    </AuthContext>
  );
};
