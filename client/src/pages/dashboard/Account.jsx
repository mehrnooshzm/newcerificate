import { useEffect, useState } from 'react';
import { useAuthContext } from '@/hooks/useAuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/supabase/supabase';

const Account = () => {
  const { currentUser, setCurrentUser, setUserData } = useAuthContext();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasPhoto, setHasPhoto] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    const fetchUserData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentUser.id)
          .maybeSingle();
        if (error) throw error;

        if (data) {
          setFormData(data);

          if (data.photoURL && !data.photoURL.includes('avatar.svg')) {
            setHasPhoto(true); // Check if user has a custom photo
          } else {
            setHasPhoto(false); // user is using default photo
          }
        } else {
          console.warn('No user data found.');
          setFormData(null);
          setHasPhoto(false);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  // Update form state on input change
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Save profile updates
  const handleSave = async () => {
    try {
      if (!currentUser || !formData) return;

      const { fullName, username, photoURL } = formData;

      if (fullName && fullName !== currentUser.user_metadata?.full_name) {
        const { error: authError } = await supabase.auth.updateUser({
          data: { full_name: fullName },
        });
        if (authError) throw authError;
      }

      // Update the users table row
      const { error: updateError } = await supabase
        .from('users')
        .update({ fullName, username, photoURL })
        .eq('id', currentUser.id);

      if (updateError) throw updateError;

      // Refresh currentUser from Supabase Auth and update context
      const {
        data: { user: refreshedUser },
      } = await supabase.auth.getUser();
      setCurrentUser(refreshedUser);

      setUserData((prev) => ({
        ...prev,
        fullName,
        username,
        photoURL,
      }));

      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Error updating profile: ' + error.message);
    }
  };

  // Upload a new profile photo
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
    const filePath = fileName;

    try {
      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData?.publicUrl;

      if (!publicUrl) throw new Error('Failed to get public URL');

      // Update Supabase users table
      const { error: updateError } = await supabase
        .from('users')
        .update({ photoURL: publicUrl })
        .eq('id', currentUser.id);

      if (updateError) throw updateError;

      setFormData((prev) => ({ ...prev, photoURL: publicUrl }));
      setUserData((prev) => ({ ...prev, photoURL: publicUrl }));

      setHasPhoto(true);

      alert('Profile photo updated!');
    } catch (err) {
      console.error('Error uploading file:', err.message);
      alert('Failed to upload photo.');
    }
  };

  const handleDeletePhoto = async () => {
    if (!currentUser || !formData?.photoURL) return;

    const fileName = formData.photoURL.split('/').pop(); // Get file name from public URL
    const filePath = fileName;

    try {
      // Delete from Supabase
      const { error: deleteError } = await supabase.storage
        .from('user-uploads')
        .remove([filePath]);

      if (deleteError) throw deleteError;

      const defaultAvatar = '/images/avatars/avatar.svg';

      // Update Supabase users table
      const { error: updateError } = await supabase
        .from('users')
        .update({ photoURL: defaultAvatar })
        .eq('id', currentUser.id);

      if (updateError) throw updateError;

      // Update state
      setFormData((prev) => ({ ...prev, photoURL: defaultAvatar }));
      setUserData((prev) => ({ ...prev, photoURL: defaultAvatar }));

      setHasPhoto(false);

      alert('Profile photo removed!');
    } catch (error) {
      console.error('Failed to delete photo:', error.message);
      alert('Error deleting profile photo.');
    }
  };

  if (loading) return <div className='p-6 text-center'>Loading...</div>;
  if (!formData)
    return <div className='p-6 text-center'>No user data found</div>;

  const baseClass = `relative flex items-center py-2 font-medium rounded-md cursor-pointer transition-colors group`;

  return (
    <>
      <style>
        {`
          main {
            margin: 0 !important;
            padding: 0 !important;
          }
        `}
      </style>
      <div className='min-h-screen w-full max-w-full text-white p-4 sm:p-6 pl-17 pt-13 overflow-x-hidden'>
        <div className='flex items-center space-x-4 mb-6'>
          <img
            src={
              formData?.photoURL ||
              currentUser?.photoURL ||
              '/images/avatars/avatar.svg'
            } // fallback if no avatar
            alt='Profile'
            className='w-20 h-20 rounded-full -ml-3'
          />

          <div className='flex flex-col space-y-2'>
            <label
              className={`text-sm text-gray-600 ${
                hasPhoto
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:underline hover:text-[var(--button-hover-color-on)]'
              }`}
            >
              Upload photo
              <input
                type='file'
                accept='image/*'
                onChange={handleFileUpload}
                className='hidden'
                disabled={hasPhoto}
              />
            </label>
            <button
              onClick={handleDeletePhoto}
              className={`text-sm text-gray-600 ${
                hasPhoto
                  ? 'hover:underline hover:text-[var(--button-hover-color-on)]'
                  : 'opacity-50 cursor-not-allowed'
              }`}
              disabled={!hasPhoto}
            >
              Remove photo
            </button>
          </div>
        </div>

        <hr className='border-t border-gray-400 my-6' />

        <div className='w-full text-gray-800 space-y-6'>
          <h2 className='text-2xl font-semibold text-gray-800'>
            Profile details
          </h2>
          <div className='space-y-4'>
            {/* Full Name */}
            <div>
              <label
                className='block text-sm font-medium text-gray-700 mb-1'
                htmlFor='fullName'
              >
                Full Name
              </label>
              <input
                id='fullName'
                type='text'
                name='fullName'
                value={formData.fullName || ''}
                onChange={handleChange}
                className='w-full max-w-full sm:w-[400px] px-4 bg-gray-200 py-2 border border-gray-400 rounded-md focus:ring-2 focus:ring-grey-500 focus:outline-none'
              />
            </div>

            {/* Email */}
            <div>
              <label
                className='block text-sm font-medium text-gray-700 mb-1'
                htmlFor='email'
              >
                Email
              </label>
              <input
                id='email'
                type='email'
                name='email'
                value={currentUser?.email || ''}
                readOnly
                className='w-full max-w-full sm:w-[400px] px-4 bg-gray-300 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-grey-500 focus:outline-none'
              />
            </div>

            {/* Username */}
            <div>
              <label
                className='block text-sm font-medium text-gray-700 mb-1'
                htmlFor='username'
              >
                Username
              </label>
              <input
                id='username'
                type='text'
                name='username'
                value={formData.username || ''}
                onChange={handleChange}
                className='w-full max-w-full sm:w-[400px] px-4 bg-gray-200 py-2 border border-gray-400 rounded-md focus:ring-2 focus:ring-grey-500 focus:outline-none'
              />
            </div>
          </div>

          {/* Save Button */}
          <div className='flex justify-start'>
            <button
              onClick={handleSave}
              className={`${baseClass} px-6 text-white transition-colors duration-200 bg-[var(--button-hover-color-on)] hover:bg-[var(--button-hover-color-out)] hover:text-[var(--primary-color)]`}
            >
              Update account
            </button>
          </div>

          {/* Password Reset Link */}
          <div className='flex justify-start'>
            <button
              onClick={() => navigate('/resetpassword')}
              className='text-sm text-gray-700 hover:underline hover:text-[var(--button-hover-color-on)] mt-4'
            >
              Update your password →
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Account;
