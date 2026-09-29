import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import { CanvasProvider } from '@/context/canvas';
import { CSVDataProvider } from '@/context/csvData';
import { Toaster } from '@/components/ui/sonner';
import CanvasEditor from '../features/canvas/CanvasEditor';
import DesignEditorNavbar from '../features/designNavbar/DesignEditorNavbar';
import DesignToolbox from '../features/designToolbox/DesignToolbox';
import PropertiesSidebar from '../features/properties/PropertiesSidebar';
import ContextMenu from '../features/canvas/ContextMenu';

const DesignEditor = () => {
  const { id } = useParams();
  const [blockHeight, setBlockHeight] = useState(0); // Dynamic height for editor layout
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile left toolbox visibility
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false); // Mobile right properties panel visibility
  // Quick Preview mode: lets mobile/tablet users view the certificate
  // without the editing toolboxes and toolbar clutter.
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const blockRef = useRef(null); // Ref to the main editor container

  // Toggle the left toolbox, closing the right properties panel if it's open
  // so only one drawer is shown at a time on mobile/tablet.
  const toggleSidebar = (updater) => {
    setIsPropertiesOpen(false);
    setIsSidebarOpen(updater);
  };

  // Entering preview should close any open drawer so only the clean
  // canvas is visible.
  const togglePreviewMode = () => {
    setIsSidebarOpen(false);
    setIsPropertiesOpen(false);
    setIsPreviewMode((prev) => !prev);
  };

  // Adjust editor height based on window size and header heights. Also exits
  // Quick Preview if the viewport grows into the desktop (xl) layout — e.g.
  // rotating a tablet or resizing the window — so the full editing layout
  // is never accidentally left hidden on desktop.
  useEffect(() => {
    const XL_BREAKPOINT = 1280;
    const header = document.querySelector('#mainHeader');
    const subheader = document.querySelector('#editorSubheader');

    const resize = () => {
      setBlockHeight(
        window.innerHeight - (header.offsetHeight + subheader.offsetHeight)
      );

      if (window.innerWidth >= XL_BREAKPOINT) {
        setIsPreviewMode(false);
      }
    };
    resize();

    window.addEventListener('resize', resize);

    // Cleanup listener on unmount
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <CanvasProvider key={id ?? 'new'}>
      <CSVDataProvider>
        {/* Navbar */}
        <DesignEditorNavbar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={toggleSidebar}
          isPreviewMode={isPreviewMode}
          onTogglePreviewMode={togglePreviewMode}
        />
        <Toaster />
        {/* Main layout */}
        <div
          className='relative flex justify-between overflow-hidden'
          ref={blockRef}
          style={{ height: `${blockHeight}px` }}
        >
          {/* Backdrop for mobile/tablet sidebar */}
          {(isSidebarOpen || isPropertiesOpen) && (
            <button
              type='button'
              aria-label='Close sidebar'
              onClick={() => {
                setIsSidebarOpen(false);
                setIsPropertiesOpen(false);
              }}
              className='absolute inset-0 z-30 bg-black/25 xl:hidden'
            />
          )}

          {/* Left toolbox — hidden while previewing on mobile/tablet */}
          {!isPreviewMode && (
            <div
              className={`absolute left-0 top-0 z-40 h-full transform transition-transform duration-300 xl:static xl:z-auto xl:translate-x-0 ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              <DesignToolbox />
            </div>
          )}
          {/* Main editor section */}
          <div className='scrollbar flex flex-1 flex-col min-w-0 min-h-0 overflow-hidden md:overflow-x-auto'>
            <div className='flex flex-1 min-w-0 min-h-0'>
              <CanvasEditor isPreviewMode={isPreviewMode} />
              <ContextMenu />
            </div>
          </div>
          {/* Right Toolbox — hidden while previewing on mobile/tablet */}
          {!isPreviewMode && (
            <div
              className={`absolute right-0 top-0 z-40 h-full transform transition-transform duration-300 xl:static xl:z-auto xl:translate-x-0 ${
                isPropertiesOpen ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              <PropertiesSidebar />
            </div>
          )}

          {/* Floating button to open properties panel on mobile/tablet */}
          {!isPreviewMode && (
            <button
              type='button'
              aria-label='Open properties'
              aria-expanded={isPropertiesOpen}
              onClick={() => {
                setIsSidebarOpen(false);
                setIsPropertiesOpen((prev) => !prev);
              }}
              className='xl:hidden fixed bottom-6 right-6 z-50 p-3 rounded-full text-white shadow-lg bg-[#373737] hover:bg-[var(--button-hover-color-on)]'
              style={{ background: 'var(--gradient-dark-color)' }}
            >
              <SlidersHorizontal size={20} />
            </button>
          )}
        </div>
      </CSVDataProvider>
    </CanvasProvider>
  );
};

export default DesignEditor;
