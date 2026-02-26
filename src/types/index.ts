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

export interface LeadershipEntry {
  id: string;
  uid: string;
  title: string;
  description: string;
  order: number;
  createdAt: Timestamp;
}

export interface Event {
  id: string;
  title: string;
  date: Timestamp;
  time?: string;
  location: string;
  description: string;
  imageUrl: string;
  storagePath?: string;
  attendees: string[];
  rsvpQuestions?: string[];
  rsvpResponses?: Record<string, string[]>;
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
