import { Outlet } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { doSignOut } from '@/supabase/auth';
import { useNavigate } from 'react-router-dom';
import { navMenuItems } from '@/constants/menuItems';
import Sidebar from '@/components/layout/Sidebar';
import SidebarItem from '@/components/layout/SidebarItem';

const Dashboard = () => {
  const navigate = useNavigate();

  // Handle user logout
  const handleLogout = async () => {
    try {
      await doSignOut(); // Sign out from Supabase
      navigate('/', { replace: true }); // Redirect to home page
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className='flex h-screen'>
      {/* Sidebar navigation */}
      <Sidebar>
        {navMenuItems.map(({ title, url, icon: Icon }) => (
          <SidebarItem
            key={title}
            icon={<Icon size={20} />}
            text={title}
            to={url}
          />
        ))}
        {/* Logout button */}
        <SidebarItem
          icon={<LogOut size={20} />}
          text='Log Out'
          onClick={handleLogout}
        />
      </Sidebar>

      {/* Dashboard content */}
      <main className='flex-1 ml-16 md:ml-0 p-6 bg-gray-100 overflow-auto'>
        {/* Nested routes will render here */}
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
