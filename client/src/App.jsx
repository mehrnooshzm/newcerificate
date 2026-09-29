import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Navigate,
} from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { initializeDesigns } from './reducers/designReducer';
import RootLayout from './components/layout/RootLayout';
import ProtectedRoute from './pages/auth/ProtectedRoute';
import Signup from './pages/auth/Signup';
import Login from './pages/auth/Login';
import HomeRedirect from './pages/auth/HomeRedirect';
import DesignEditor from './pages/DesignEditor';
import Account from './pages/dashboard/Account';
import MyCertificates from './pages/certificates/MyCertificates';
import TemplatesGallery from './pages/dashboard/TemplatesGallery';
import Dashboard from './pages/dashboard/Dashboard';
import ResetPassword from './pages/auth/ResetPassword';
import ChangePassword from './pages/auth/ChangePassword';
import FAQ from './pages/dashboard/FAQ';
import { useAuthContext } from './hooks/useAuthContext';
import { preloadFonts } from './utils/preloadFonts';
import { fonts } from './constants/fonts';

import './index.css';

const App = () => {
  const dispatch = useDispatch();
  const { currentUser, loading } = useAuthContext();

  // Preload all custom fonts for canvas rendering
  useEffect(() => {
    preloadFonts(fonts);
  }, []);

  // Initialize designs in Redux store when user is logged in
  useEffect(() => {
    if (currentUser) {
      dispatch(initializeDesigns());
    }
  }, [currentUser]);

  if (loading) {
    // Show loading state while auth status is being checked
    return <div className='text-center mt-10'>Loading...</div>;
  }

  // Define routes using React Router v6
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<RootLayout />}>
        <Route index element={<HomeRedirect />} />
        <Route path='signup' element={<Signup />} />
        <Route path='login' element={<Login />} />
        <Route path='resetpassword' element={<ResetPassword />} />
        <Route path='changepassword' element={<ChangePassword />} />

        {/* Protected dashboard routes */}
        <Route
          path='dashboard'
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to='certificates' replace />} />
          <Route path='certificates' element={<MyCertificates />} />
          <Route path='templates' element={<TemplatesGallery />} />
          <Route path='account' element={<Account />} />
          <Route path='faq' element={<FAQ />} />
        </Route>

        {/* Design editor routes */}
        <Route
          path='designs/new'
          element={
            <ProtectedRoute>
              <DesignEditor />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path='designs/:id'
          element={
            <ProtectedRoute>
              <DesignEditor />
            </ProtectedRoute>
          }
        />
      </Route>
    )
  );

  return <RouterProvider router={router} />;
};

export default App;
