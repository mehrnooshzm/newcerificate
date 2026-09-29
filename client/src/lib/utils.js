import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility function to combine class names and merge Tailwind classes
export function cn(...inputs) {
  // clsx combines conditional class names
  // twMerge intelligently merges Tailwind classes (e.g., removes duplicates, handles conflicts)
  return twMerge(clsx(inputs));
}
