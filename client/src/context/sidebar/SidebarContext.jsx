import { useState } from 'react';
import { createContext } from 'react';

// Create a context to manage sidebar state
export const SidebarContext = createContext(null);

// Provider component to wrap parts of the app that need sidebar state
export const SidebarProvider = ({ children }) => {
  // Track whether the sidebar is expanded or collapsed
  const [expanded, setExpanded] = useState(true);

  return (
    <SidebarContext value={{ expanded, setExpanded }}>
      {children}
    </SidebarContext>
  );
};
