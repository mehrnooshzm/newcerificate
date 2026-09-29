import { useSidebarContext } from '@/hooks/useSidebarContext';
import { NavLink } from 'react-router-dom';

// Individual sidebar item component
const SidebarItem = ({ icon, text, to, onClick }) => {
  const { expanded } = useSidebarContext(); // Get sidebar expanded/collapsed state

  // Base styling depending on whether sidebar is expanded
  const baseClass = `w-full relative flex items-center py-2 font-medium rounded-md cursor-pointer transition-colors duration-200 group ${
    expanded ? 'px-3' : 'justify-center'
  }`;

  // Content of the sidebar item
  const content = (
    <>
      <div className='flex items-center space-x-3'>
        <div className='relative w-6 h-6 flex items-center justify-center flex-shrink-0'>
          {/* Icon */}
          {icon}
        </div>
        {/* Text only shown when sidebar is expanded */}
        {expanded && <span className='whitespace-nowrap'>{text}</span>}
      </div>
      {/* Tooltip for collapsed sidebar */}
      {!expanded && (
        <div
          className='absolute left-full rounded-md px-2 py-1 ml-6
                     bg-gray-800 text-white text-sm
                     invisible opacity-0 -translate-x-3 transition-all
                     group-hover:visible group-hover:opacity-100 group-hover:translate-x-0'
        >
          {text}
        </div>
      )}
    </>
  );

  return (
    <li>
      {onClick ? (
        // Render as button if onClick is provided
        <button
          onClick={onClick}
          className={`${baseClass} hover:bg-[var(--button-hover-color-out)] hover:text-[var(--primary-color)]`}
        >
          {content}
        </button>
      ) : (
        // Otherwise render as navigation link
        <NavLink
          to={to}
          className={({ isActive }) =>
            `${baseClass} ${
              isActive
                ? 'bg-[var(--secondary-color)] text-white'
                : 'hover:bg-[var(--button-hover-color-out)] hover:text-[var(--primary-color)]'
            }`
          }
        >
          {content}
        </NavLink>
      )}
    </li>
  );
};

export default SidebarItem;
