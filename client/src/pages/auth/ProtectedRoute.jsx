import { useAuthContext } from '@/hooks/useAuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { userLoggedIn } = useAuthContext(); // Check if user is authenticated

  // If logged in, render the protected content; otherwise, redirect to home
  return userLoggedIn ? children : <Navigate to='/' replace />;
};

export default ProtectedRoute;
