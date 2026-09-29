import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/supabase/supabase';

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false); // true once a recovery session is confirmed

  // Supabase automatically exchanges the recovery link and fires this event
  // once a temporary "recovery" session is established for this browser.
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setReady(true);
        }
      }
    );

    // Fallback: if a session already exists on mount (e.g. fast refresh),
    // still allow the form since Supabase may have already processed the link.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      // Confirm the password reset with Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setMessage('Password reset successfully. You can now log in.');
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className='w-full h-screen flex items-center justify-center bg-[var(--primary-color)]'>
      <div className='w-100 max-w-md bg-[var(--quaternary-color)] px-8 py-6 rounded-xl -mt-20 space-y-5'>
        <h2 className='text-black text-center text-[1.05rem] py-2 font-semibold capitalize'>
          Reset your password
        </h2>
        {/* Show error or success messages */}
        {error && <p className='text-red-800'>{error}</p>}
        {!ready && !error && !message && (
          <p className='text-gray-600 text-center'>Verifying reset link...</p>
        )}
        {message ? (
          <p className='text-green-800'>{message}</p>
        ) : (
          ready && (
            <form onSubmit={handleSubmit} className='space-y-3'>
              {/* New password input */}
              <input
                type='password'
                placeholder='New password'
                className='w-full px-3 py-2 bg-white text-gray-500 outline-none focus:indigo-600 rounded-md transition duration-300'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              {/* Confirm password input */}
              <input
                type='password'
                placeholder='Confirm password'
                className='w-full px-3 py-2 bg-white text-gray-500 outline-none focus:indigo-600 rounded-md transition duration-300'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {/* Submit button */}
              <button
                type='submit'
                className='w-full px-4 py-2 text-white bg-[var(--secondary-color)] hover:bg-[var(--button-hover-color-out)] hover:text-black transition-colors duration-300 rounded-md'
              >
                Update Password
              </button>
            </form>
          )
        )}
        <p className='text-center mt-4'>
          Changed your mind?{' '}
          <Link to='/login' className='hover:underline font-bold'>
            Return to Login
          </Link>
        </p>
      </div>
    </main>
  );
};

export default ChangePassword;
