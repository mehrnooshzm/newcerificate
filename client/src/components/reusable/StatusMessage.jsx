import { cn } from '@/lib/utils';
import { FileCheck, FileX } from 'lucide-react';

// Map of status types to their corresponding icons
const STATUS_ICONS = {
  'success': <FileCheck />,
  'failure': <FileX />,
};

// StatusMessage component displays a message with an icon based on type
const StatusMessage = ({ className, type, message }) => {
  // Return nothing if type or message is empty
  if (!type?.trim() || !message?.trim()) return null;

  return (
    <div className={cn('text-md text-white', className)}>
      {STATUS_ICONS[type]} <span>{message}</span>
    </div>
  );
};

export default StatusMessage;
