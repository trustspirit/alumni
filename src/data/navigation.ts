import type { NavItem } from '@/types';

export const mainNavItems: NavItem[] = [
  { label: 'nav.about', href: '/about' },
  { label: 'nav.events', href: '/events' },
  { label: 'nav.news', href: '/news' },
  { label: 'nav.gallery', href: '/gallery' },
  { label: 'nav.directory', href: '/directory', requiredRole: 'manager' },
  { label: 'nav.give', href: '/give' },
];
