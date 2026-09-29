import {
  LayoutDashboard,
  Images,
  SquareUserRound,
  FileQuestionMark,
} from 'lucide-react';

// Navigation menu items for the dashboard sidebar
export const navMenuItems = [
  {
    title: 'My Certificates', // Menu label
    url: '/dashboard/certificates', // Navigation URL
    icon: Images, // Icon component
  },
  {
    title: 'Templates Gallery',
    url: '/dashboard/templates',
    icon: LayoutDashboard,
  },
  {
    title: 'FAQ',
    url: '/dashboard/faq',
    icon: FileQuestionMark,
  },
  {
    title: 'Account',
    url: '/dashboard/account',
    icon: SquareUserRound,
  },
];
