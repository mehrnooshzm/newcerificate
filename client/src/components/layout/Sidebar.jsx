import { useAuthContext } from '@/hooks/useAuthContext';
import { SidebarProvider } from '@/context/sidebar';
import { useSidebarContext } from '@/hooks/useSidebarContext';
import { ChevronFirst, ChevronLast } from 'lucide-react';

// Content of the sidebar, handles expanded/collapsed state and user info
const SidebarContent = ({ children }) => {
  const { currentUser, userData } = useAuthContext();
  const { expanded, setExpanded } = useSidebarContext();
  const isSidebarOpen = expanded;
  const setIsSidebarOpen = setExpanded;

  const displayName = userData?.username || currentUser?.displayName || 'User';

  return (
    <aside
      className={`fixed left-0 top-[90px] z-40 h-[calc(100vh-90px)] bg-gray-800 text-white border-r transition-all duration-300 md:static md:top-auto md:h-screen ${
        isSidebarOpen ? 'w-64' : 'w-16'
      }`}
    >
      <nav
        className='h-full flex flex-col gap-3 p-3 bg-[var(--primary-color)] text-white border-r '
        style={{ background: 'var(--gradient-dark-color)' }}
      >
        {/* User info and collapse/expand button */}
        <div className='flex justify-between items-center'>
          {/* Show user avatar when expanded */}
          {expanded && (
            <img
              src={
                userData?.photoURL ||
                currentUser?.photoURL ||
                '/images/avatars/avatar.svg'
              }
              alt='User'
              className='h-[40px] w-[40px] rounded-full'
            />
          )}
          {/* Display user name when expanded */}
          <div
            className={`overflow-hidden transition-all ${
              isSidebarOpen ? 'w-52 ml-3' : 'w-0'
            }`}
          >
            <span className='font-semibold leading-4'>{displayName}</span>
          </div>

          {/* Toggle sidebar expand/collapse */}
          <button
            onClick={() => setIsSidebarOpen((curr) => !curr)}
            className='p-1.5 rounded-lg bg-gray-50 hover:bg-gray-200 text-black'
          >
            {isSidebarOpen ? <ChevronFirst size={18} /> : <ChevronLast size={18} />}
          </button>
        </div>
        {/* Sidebar navigation items */}
        <ul className='flex-1 space-y-3'>{children}</ul>
      </nav>
    </aside>
  );
};

// Sidebar wrapper providing context
const Sidebar = ({ children }) => {
  return (
    <SidebarProvider>
      <SidebarContent>{children}</SidebarContent>
    </SidebarProvider>
  );
};

export default Sidebar;
