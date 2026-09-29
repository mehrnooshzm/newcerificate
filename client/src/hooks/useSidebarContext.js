import { useContext } from 'react';
import { SidebarContext } from '../context/sidebar/SidebarContext';

// Custom hook to access sidebar state and actions
export const useSidebarContext = () => {
  const context = useContext(SidebarContext);

  // Ensure the hook is used within a SidebarContext provider
  if (!context) {
    throw new Error(
      'useSidebarContext hook must be used within SidebarContext'
    );
  }

  return context; // Return sidebar state and actions
};
