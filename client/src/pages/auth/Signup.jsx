import { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/hooks/useAuthContext';
import { doCreateUserWithEmailAndPassword } from '@/supabase/auth';

const Signup = () => {
  const navigate = useNavigate();

  // Form state
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setconfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // Loading state
  const [errorMessage, setErrorMessage] = useState('');

  const { userLoggedIn, loading } = useAuthContext();
  // Validation regex
  const passwordRegex = /^(?=.*[0-9])(?=.*[^A-Za-z0-9])(.{8,})$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Show loading or redirect if already logged in
  if (loading) return <div>Loading...</div>;
  if (userLoggedIn) return <Navigate to='/' replace />;

  // Handle form submission
  const onSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    if (!passwordRegex.test(password)) {
      setErrorMessage(
        'Password must be at least 8 characters and include a number and a special character.'
      );
      return;
    }

    try {
      setIsRegistering(true);
      await doCreateUserWithEmailAndPassword(fullname, email, password);
      navigate('/dashboard'); // Redirect after signup
    } catch (error) {
      console.error('Signup error:', error);

     
      const alreadyRegistered =
        error.code === 'user_already_exists' ||
        error.message?.toLowerCase().includes('already registered') ||
        error.message?.toLowerCase().includes('already exists');

      if (alreadyRegistered) {
        setErrorMessage('This email is already registered. Please log in.');
      } else {
        setErrorMessage(error.message);
      }
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <main className='w-full h-screen flex items-center justify-center bg-[var(--primary-color)]'>
      <div className='w-100 max-w-md  bg-[#B4B4B4] px-8 py-6 rounded-xl -mt-20 space-y-5'>
        <h3 className='text-black text-center text-[1.05rem] py-2 font-semibold capitalize'>
          Create a new account
        </h3>
        <form onSubmit={onSubmit} className='space-y-3'>
          {/* Full name input */}
          <div>
            <input
              type='text'
              placeholder='Full Name'
              required
              value={fullname}
              onChange={(e) => {
                setFullname(e.target.value);
              }}
              className='w-full px-3 py-2 bg-white text-gray-500 outline-none focus:indigo-600 rounded-md transition duration-300'
            />
          </div>

          {/* Email input */}
          <div>
            <input
              type='email'
              placeholder='Email'
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              className='w-full px-3 py-2 bg-white text-gray-500 outline-none focus:indigo-600 rounded-md transition duration-300'
            />
          </div>
          {/* Password input */}
          <div>
            <input
              disabled={isRegistering}
              type='password'
              autoComplete='new-password'
              placeholder='Password'
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              className='w-full px-3 py-2 bg-white text-gray-500 outline-none focus:indigo-600 rounded-md transition duration-300'
            />
          </div>
          {/* Confirm password input */}
          <div>
            <input
              disabled={isRegistering}
              type='password'
              placeholder='Confirm password'
              autoComplete='off'
              required
              value={confirmPassword}
              onChange={(e) => {
                setconfirmPassword(e.target.value);
              }}
              className='w-full px-3 py-2 bg-white text-gray-500 outline-none focus:indigo-600 rounded-md transition duration-300'
            />
          </div>

          {/* Display error message */}
          {errorMessage && (
            <span className='text-red-900 font-bold'>{errorMessage}</span>
          )}
          {/* Submit button */}
          <button
            type='submit'
            disabled={isRegistering}
            className={`w-full px-4 py-2 text-white ${
              isRegistering
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-[var(--secondary-color)] hover:bg-[var(--button-hover-color-out)] hover:text-black transition-colors duration-300 rounded-md'
            }`}
          >
            {isRegistering ? 'Signing Up...' : 'Sign Up'}
          </button>

          <div className='my-4 border-t border-gray-200 w-full'></div>
          {/* Link to login page */}
          <div className='text-black text-center  bg-[#B4B4B4]'>
            Already have an account? {'   '}
            <Link to={'/login'} className='hover:underline font-bold'>
              Log In
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Signup;
