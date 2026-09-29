import { useAuthContext } from '@/hooks/useAuthContext';
import LandingPage from '@/pages/LandingPage';
import { Navigate } from 'react-router-dom';

const HomeRedirect = () => {
  const { userLoggedIn } = useAuthContext(); // Get current auth status

  // Redirect logged-in users to dashboard, otherwise show landing page
  return userLoggedIn ? (
    <Navigate to='/dashboard/certificates' replace />
  ) : (
    <LandingPage />
  );
};

export default HomeRedirect;
