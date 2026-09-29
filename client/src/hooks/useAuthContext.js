import { useContext } from 'react';
import { AuthContext } from '../context/auth/AuthContext';

// Custom hook to access the authentication context
export const useAuthContext = () => {
  const context = useContext(AuthContext);

  // Ensure the hook is used within an AuthContext provider
  if (!context) {
    throw new Error('useAuthContext hook must be used within AuthContext');
  }

  return context; // Return the auth context value (user, login, logout, etc.)
};
