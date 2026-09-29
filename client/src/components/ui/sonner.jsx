import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

// Toaster component wrapping Sonner's Toaster with theme support
const Toaster = ({ ...props }) => {
  const { theme = 'system' } = useTheme(); // Get current theme (light/dark/system)

  return (
    <Sonner
      theme={theme}
      className='toaster group'
      style={{
        '--normal-bg': 'var(--popover)',
        '--normal-text': 'var(--popover-foreground)',
        '--normal-border': 'var(--border)',
      }}
      {...props}
    />
  );
};

export { Toaster };
