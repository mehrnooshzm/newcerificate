import {
  Disclosure,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/react';
import { MoveRight } from 'lucide-react';
import { useMatch, useNavigate, useLocation, Link } from 'react-router-dom';
import { navMenuItems } from '@/constants/menuItems';
import { useAuthContext } from '@/hooks/useAuthContext';
import { supabase } from '@/supabase/supabase';

// Simple horizontal line component used in user menu
const HorizontalLine = () => <hr className='bg-[#bebebe] my-[15px]' />;

const Header = () => {
  const match = useMatch('/designs/:id'); // Check if current route matches a design page
  const location = useLocation(); // Get current route info
  const navigate = useNavigate(); // Navigation function
  const { currentUser, userLoggedIn, loading, userData } = useAuthContext(); // User state

  // Determine display name and email for user menu
  const displayName =
    userData?.username || currentUser?.user_metadata?.full_name || 'User';
  const email = currentUser?.email || 'No Email';

  // Show login button only on homepage if user is not logged in
  const showLoginButton =
    !userLoggedIn && location.pathname === '/' && !loading;

  // Sign out handler
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // Small delay to allow AuthContext to update state
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 100); // Delay allows AuthContext to update state first
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Disclosure
      as='header'
      id='mainHeader'
      className='flex flex-col justify-center h-[90px] bg-[var(--secondary-color)]'
    >
      <div className='w-full mx-auto max-w-7xl px-2 sm:px-6 lg:px-8'>
        <div className='relative flex items-center justify-between'>
          {/* Logo linking to homepage */}
          <Link to='/' className='flex shrink-0'>
            <img
              alt='Certi4U Logo'
              src='/images/logos/certi4U-new.svg'
              className='w-[125px] h-auto text-red-500'
            />
          </Link>

          {/* Show login button if user is not logged in */}
          {showLoginButton && (
            <Link
              className='text-lg text-white font-semibold flex items-center gap-1 group'
              to='/login'
            >
              Log in
              <MoveRight
                className='transition-transform duration-300 group-hover:translate-x-2'
                size={20}
              />
            </Link>
          )}

          {/* Show user menu if on a design page */}
          {match && (
            <Menu as='div'>
              <MenuButton className='flex rounded-full cursor-pointer focus:outline-hidden'>
                <span className='sr-only'>Open user menu</span>
                <img
                  alt='User Profile Photo'
                  src={
                    userData?.photoURL ||
                    currentUser?.user_metadata?.avatar_url ||
                    '/images/avatars/avatar.svg'
                  }
                  className='h-[55px] w-[55px] rounded-full'
                />
              </MenuButton>
              <MenuItems
                transition
                className='absolute right-0 z-10 mt-2 w-[230px] origin-top-right text-[#bebebe] bg-[#494848] p-[20px] transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in'
              >
                {/* User info section */}
                <div className='flex flex-col items-start space-y-[7px]'>
                  <img
                    alt='User Profile Photo'
                    src={
                      userData?.photoURL ||
                      currentUser?.user_metadata?.avatar_url ||
                      '/images/avatars/avatar.svg'
                    }
                    className='h-[55px] w-[55px] rounded-full'
                  />
                  <span className='text-[#f5f5f5] font-extrabold'>
                    {displayName}
                  </span>
                  <span className='text-[13px]'>{email}</span>
                </div>
                <HorizontalLine />

                {/* Navigation menu items */}
                <ul>
                  {navMenuItems.map(({ title, url }) => (
                    <li key={title}>
                      <MenuItem>
                        <Link
                          to={url}
                          className='block py-[12px] capitalize data-focus:outline-hidden focus:underline hover:underline focus:text-white hover:text-white'
                        >
                          {title}
                        </Link>
                      </MenuItem>
                    </li>
                  ))}
                </ul>
                <HorizontalLine />

                {/* Logout button */}
                <MenuItem>
                  <button
                    onClick={handleSignOut}
                    className='block py-[12px] capitalize data-focus:outline-hidden focus:underline hover:underline focus:text-white hover:text-white'
                  >
                    Log Out
                  </button>
                </MenuItem>
              </MenuItems>
            </Menu>
          )}
        </div>
      </div>
    </Disclosure>
  );
};

export default Header;
