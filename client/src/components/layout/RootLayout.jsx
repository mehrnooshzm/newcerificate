import { Outlet } from 'react-router-dom';
import Header from './Header';

// Root layout that wraps all pages with a header and outlet for nested routes
const RootLayout = () => {
  return (
    <div className='min-h-screen flex flex-col'>
      {/* Header displayed on all pages */}
      <Header />

      {/* Outlet renders the matched child route */}
      <Outlet />
    </div>
  );
};

export default RootLayout;
