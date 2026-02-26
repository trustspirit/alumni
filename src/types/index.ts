import type { Timestamp } from 'firebase/firestore';

export type UserRole = 'admin' | 'manager' | 'member';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  position?: string;
  linkedIn?: string;
  socialLinks?: Record<string, string>;
  graduationYear?: string;
  profileImageUrl?: string;
  role: UserRole;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface NavItem {
  label: string;
  href: string;
  isExternal?: boolean;
  requiredRole?: UserRole;
}

export interface LeadershipMember {
  name: string;
  role: string;
  imageUrl: string;
  bio?: string;
}

export interface Event {
  id: string;
  title: string;
  date: Timestamp;
  location: string;
  description: string;
  imageUrl: string;
  storagePath?: string;
  attendees: string[];
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface NewsItem {
  id: string;
  title: string;
  date: Timestamp;
  summary: string;
  content: string;
  imageUrl: string;
  storagePath?: string;
  link?: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface GalleryImage {
  id: string;
  src: string;
  storagePath?: string;
  alt: string;
  category: string;
  uploadedBy: string;
  createdAt: Timestamp;
}

export interface ContactInfo {
  email: string;
  phone?: string;
  address?: string;
  socialLinks: SocialLink[];
}

export interface SocialLink {
  platform: string;
  url: string;
}
