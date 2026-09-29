import * as React from 'react';

import { cn } from '@/lib/utils';

// Textarea component with styling and support for additional props
function Textarea({ className, ...props }) {
  return (
    <textarea
      data-slot='textarea'
      className={cn(
        // Tailwind classes for styling, focus, disabled state, and responsive text
        'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/20 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base  outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm max-h-[4.5rem] overflow-y-auto',
        className
      )}
      {...props} // Spread other textarea props like value, onChange, etc.
    />
  );
}

export { Textarea };
