import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { doSignInWithEmailAndPassword } from '@/supabase/auth';
import { useAuthContext } from '@/hooks/useAuthContext';
import migratePassword from '../../services/migratePassword';

const Login = () => {
  const navigate = useNavigate();
  const { userLoggedIn } = useAuthContext(); // Check if user is already logged in

  const [email, setEmail] = useState(''); // User email input
  const [password, setPassword] = useState(''); // User password input
  const [isSigningIn, setIsSigningIn] = useState(false); // Loading state
  const [errorMessage, setErrorMessage] = useState(''); // Error message state

  const attemptLogin = async (email, password) => {
    const result = await doSignInWithEmailAndPassword(email, password);
    console.log('Login successful after migration:', result);

    if (result?.error) {
      throw result.error;
    }
    if (result?.data?.user) {
      navigate('/dashboard/certificates');
      return true;
    }
    return false;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSigningIn(true);
    setErrorMessage('');

    try {
      // Attempt 1: normal Supabase login
      await attemptLogin(email, password);
    } catch (supabaseError) {
      console.error('Login error:', supabaseError);

      try {
        // Attempt 2: verify password against Firebase + migrate it to Supabase
        await migratePassword(email, password);

        // Migration succeeded — retry the real login
        await attemptLogin(email, password);
      } catch (migrateError) {
        // axios error shape: the backend's actual error message lives at
        // migrateError.response.data.error (NOT migrateError.code)
        const backendError = migrateError.response?.data?.error;

        let message;

        if (backendError) {
          // errors coming from our own backend (migrate-password endpoint)
          switch (backendError) {
            case 'Wrong password':
            case 'user not found':
              message = 'Invalid email or password. Please try again.';
              break;
            case 'Supabase user mapping not found':
              message = 'Account setup incomplete. Please contact support.';
              break;
            default:
              message = 'Login failed. Please try again later.';
          }
        } else {
          // errors coming from Supabase
          switch (supabaseError.code) {
            case 'invalid_credentials':
              message = 'Invalid email or password. Please try again.';
              break;
            case 'email_not_confirmed':
              message = 'Please verify your email before logging in.';
              break;
            case 'user_not_found':
              message = 'Invalid email or password. Please try again.';
              break;
            case 'over_request_rate_limit':
            case 'over_email_send_rate_limit':
              message = 'Too many login attempts. Please wait and try again.';
              break;
            case 'invalid_email':
              message = 'Please enter a valid email address.';
              break;
            default:
              message = 'Login failed. Please try again later.';
          }
        }

        setErrorMessage(message);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div>
      {/* Redirect logged-in users to home */}
      {userLoggedIn && <Navigate to={'/'} replace={true} />}
      <main className='w-full h-screen flex self-center place-content-center place-items-center bg-[var(--primary-color)] '>
        <div className='w-100 text-gray-600 space-y-5 px-8 py-4 bg-[#B4B4B4] rounded-xl -mt-20'>
          <h3 className='text-black text-center text-[1.05rem] py-2 font-semibold capitalize'>
            Log in to your account
          </h3>
          {/* Login form */}
          <form onSubmit={onSubmit} className='space-y-3'>
            <div>
              <input
                type='email'
                required
                placeholder='Email'
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                className='w-full px-3 py-2 bg-white text-gray-500 outline-none focus:indigo-600 rounded-md transition duration-300'
              />
            </div>

            <div>
              <input
                type='password'
                autoComplete='new-password'
                required
                placeholder='Password'
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                className='w-full px-3 py-2 bg-white text-gray-500 outline-none focus:indigo-600 rounded-md transition duration-300'
              />
            </div>

            {/* Display error if login fails */}
            {errorMessage && (
              <span className='text-red-900 font-bold'>{errorMessage}</span>
            )}
            <button
              type='submit'
              disabled={isSigningIn}
              className={`w-full px-4 py-2 text-white ${
                isSigningIn
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-[var(--secondary-color)] hover:bg-[var(--button-hover-color-out)] hover:text-black transition-colors duration-300 rounded-md'
              }`}
            >
              {isSigningIn ? 'Logging In...' : 'Log In'}
            </button>
          </form>

          {/* Links for sign up and password reset */}
          <div className='mt-4 text-black text-center'>
            Don't have an account? {'   '}
            <Link to={'/signup'} className='hover:underline font-bold'>
              Sign Up
            </Link>
          </div>
          <div className='my-4 border-t border-gray-300 w-full'></div>
          <div className='text-center mt-2'>
            <Link
              to={'/resetpassword'}
              className='hover:underline pt-3 font-semi-bold text-black mt-4 '
            >
              Forgot password?
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
