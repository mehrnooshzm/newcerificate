import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/supabase/supabase';

const ResetPassword = () => {
  const [email, setEmail] = useState(''); // Store user's email input
  const [message, setMessage] = useState(''); // Success message
  const [error, setError] = useState(''); // Error message

  // Handle form submission for password reset
  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      // Send reset email via Supabase.
      // redirectTo tells Supabase which page to send the user to after
      // they click the email link (must be an allowed Redirect URL in
      // Supabase Dashboard > Authentication > URL Configuration).
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/changePassword`,
        }
      );

      if (resetError) throw resetError;

      setMessage('Password reset email sent. Check your inbox.');
    } catch (err) {
      setError(err.message); // Show error if sending fails
    }
  };

  return (
    <main className='w-full h-screen flex items-center justify-center bg-[var(--primary-color)]'>
      <div className='w-100 max-w-md  bg-[#B4B4B4] px-8 py-6 rounded-xl -mt-20 space-y-5'>
        <h2 className='text-black text-center text-[1.05rem] py-2 font-semibold capitalize'>
          Reset password
        </h2>
        <form onSubmit={handleReset} className='space-y-3'>
          {/* Email input */}
          <input
            type='email'
            placeholder='Enter your email'
            className='w-full px-3 py-2 bg-white text-gray-500 outline-none focus:indigo-600 rounded-md transition duration-300'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {/* Display messages */}
          {message && <p className='text-green-800 text-center'>{message}</p>}
          {error && <p className='text-red-800 text-center'>{error}</p>}
          <button
            type='submit'
            className='w-full px-4 py-2 text-white bg-[var(--secondary-color)] hover:bg-[var(--button-hover-color-out)] hover:text-black transition-colors duration-300 rounded-md'
          >
            Send Reset Email
          </button>

          <div className='my-4 border-t border-gray-300 w-full'></div>

          <p className='py-2 text-[var-(--primary-color)] text-center'>
            Enter your email address and we will send you a link to reset your
            password.
          </p>

          {/* Link to return to login */}
          <p className='text-center mt-4'>
            Changed your mind?{' '}
            <Link to='/login' className='hover:underline font-bold'>
              Return to Login
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
};

export default ResetPassword;
