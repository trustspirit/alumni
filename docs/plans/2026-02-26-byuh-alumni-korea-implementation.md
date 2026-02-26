# BYUH Alumni Korea Chapter Website - Implementation Plan (v2)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a web application for BYU-Hawaii Alumni Korea Chapter with Google SSO auth, RBAC (admin/manager/member), admin CRUD for events/news/gallery, member directory, event RSVP, BYUH Crimson branding, and Firebase deployment.

**Architecture:** Vite + React 19 SPA with React Router v7 for hybrid routing. Firebase Auth (Google SSO) for authentication, Firestore for data, Storage for images. TanStack Query v5 manages data caching with staleTime per data type and mutation-based cache invalidation. RBAC enforced at both client (RoleGuard components) and server (Firestore/Storage Rules) levels. Tailwind CSS v4 with cn() utility for clean styling.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, React Router v7, TanStack Query v5, Firebase (Auth, Firestore, Storage, Hosting), clsx, tailwind-merge

**Design Doc:** `docs/plans/2026-02-26-byuh-alumni-korea-design.md`

---

## Task 1: Project Scaffolding & Configuration

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- Create: `vite.config.ts`, `index.html`
- Create: `src/main.tsx`, `src/App.tsx`, `src/index.css`
- Create: `.gitignore`, `.env.example`

**Step 1: Initialize Vite + React + TypeScript**

```bash
cd /Users/young/Documents/Workspace/byuh-alumni-korea
npm create vite@latest . -- --template react-ts
```

**Step 2: Install core dependencies**

```bash
npm install react-router-dom@7 @tanstack/react-query clsx tailwind-merge firebase
```

**Step 3: Install dev dependencies**

```bash
npm install -D @tailwindcss/vite tailwindcss @types/node
```

**Step 4: Configure vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
        },
      },
    },
    sourcemap: false,
  },
});
```

**Step 5: Configure Tailwind in src/index.css**

```css
@import "tailwindcss";

@theme {
  --color-byuh-crimson: #BA0C2F;
  --color-byuh-crimson-dark: #8E0A24;
  --color-byuh-gold: #946F0A;
  --color-byuh-gold-light: #C4A035;
  --color-surface: #F6F6F8;
  --color-text-primary: #1A1A2E;
  --color-text-secondary: #4A4A5A;

  --font-heading: 'Montserrat', sans-serif;
  --font-body: 'Public Sans', sans-serif;
}

@layer base {
  html {
    scroll-behavior: smooth;
  }
  body {
    font-family: var(--font-body);
    color: var(--color-text-primary);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
  }
}
```

**Step 6: Update index.html**

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="BYU-Hawaii Alumni Korea Chapter - 브리검영 대학교 하와이 한국 동문회" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&family=Public+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
    <title>BYUH Alumni Korea Chapter</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 7: Create .gitignore**

```
node_modules/
dist/
.env
.env.local
.firebase/
*.log
.DS_Store
```

**Step 8: Create .env.example**

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

**Step 9: Verify project builds**

```bash
npm run dev
```

Expected: Vite dev server starts at localhost:5173.

---

## Task 2: Utility Library, Types & Constants

**Files:**
- Create: `src/lib/cn.ts`
- Create: `src/lib/queryClient.ts`
- Create: `src/types/index.ts`
- Create: `src/constants/index.ts`

**Step 1: Create cn() utility**

```typescript
// src/lib/cn.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Step 2: Create TanStack Query client**

```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const STALE_TIMES = {
  static: Infinity,
  frequent: 5 * 60 * 1000,
  moderate: 10 * 60 * 1000,
} as const;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: STALE_TIMES.static,
    },
  },
});
```

**Step 3: Create TypeScript types**

```typescript
// src/types/index.ts
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
  link?: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface GalleryImage {
  id: string;
  src: string;
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
```

**Step 4: Create constants**

```typescript
// src/constants/index.ts
export const SITE_NAME = 'BYUH Alumni Korea Chapter';
export const SITE_DESCRIPTION = '브리검영 대학교 하와이 한국 동문회';

export const EXTERNAL_LINKS = {
  byuh: 'https://www.byuh.edu/',
  byuhAlumni: 'https://alumni.byu.edu/',
  give: 'https://www.byuh.edu/giving',
} as const;

export const SECTION_IDS = {
  hero: 'hero',
  about: 'about',
  events: 'events',
  news: 'news',
  gallery: 'gallery',
  join: 'join',
  give: 'give',
  contact: 'contact',
} as const;

export const UPLOAD_LIMITS = {
  profileImage: 2 * 1024 * 1024,
  eventImage: 5 * 1024 * 1024,
  newsImage: 5 * 1024 * 1024,
  galleryImage: 10 * 1024 * 1024,
} as const;

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
```

**Step 5: Verify**

```bash
npx tsc --noEmit
```

---

## Task 3: Firebase SDK Setup

**Files:**
- Create: `src/lib/firebase.ts`
- Create: `src/lib/auth.ts`
- Create: `src/lib/firestore.ts`
- Create: `src/lib/storage.ts`

**Step 1: Firebase app initialization**

```typescript
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

**Step 2: Auth helpers**

```typescript
// src/lib/auth.ts
import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from './firebase';

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOut() {
  await firebaseSignOut(auth);
}
```

**Step 3: Firestore CRUD helpers**

```typescript
// src/lib/firestore.ts
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, orderBy, Timestamp, arrayUnion, arrayRemove, setDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import type { UserProfile, Event, NewsItem, GalleryImage, UserRole } from '@/types';

// ---- Users ----
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { uid: snap.id, ...snap.data() } as UserProfile : null;
}

export async function createUserProfile(uid: string, data: Omit<UserProfile, 'uid' | 'role' | 'createdAt' | 'updatedAt'>) {
  await setDoc(doc(db, 'users', uid), {
    ...data,
    role: 'member' as UserRole,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: Timestamp.now() });
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(query(collection(db, 'users'), orderBy('name')));
  return snap.docs.map(d => ({ uid: d.id, ...d.data() }) as UserProfile);
}

export async function updateUserRole(uid: string, role: UserRole) {
  await updateDoc(doc(db, 'users', uid), { role, updatedAt: Timestamp.now() });
}

// ---- Events ----
export async function getEvents(): Promise<Event[]> {
  const snap = await getDocs(query(collection(db, 'events'), orderBy('date', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Event);
}

export async function createEvent(data: Omit<Event, 'id' | 'attendees' | 'createdAt' | 'updatedAt'>) {
  return addDoc(collection(db, 'events'), {
    ...data,
    attendees: [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

export async function updateEvent(id: string, data: Partial<Event>) {
  await updateDoc(doc(db, 'events', id), { ...data, updatedAt: Timestamp.now() });
}

export async function deleteEvent(id: string) {
  await deleteDoc(doc(db, 'events', id));
}

export async function rsvpEvent(eventId: string, uid: string, attending: boolean) {
  const ref = doc(db, 'events', eventId);
  await updateDoc(ref, {
    attendees: attending ? arrayUnion(uid) : arrayRemove(uid),
  });
}

// ---- News ----
export async function getNews(): Promise<NewsItem[]> {
  const snap = await getDocs(query(collection(db, 'news'), orderBy('date', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as NewsItem);
}

export async function createNews(data: Omit<NewsItem, 'id' | 'createdAt' | 'updatedAt'>) {
  return addDoc(collection(db, 'news'), {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

export async function updateNews(id: string, data: Partial<NewsItem>) {
  await updateDoc(doc(db, 'news', id), { ...data, updatedAt: Timestamp.now() });
}

export async function deleteNews(id: string) {
  await deleteDoc(doc(db, 'news', id));
}

// ---- Gallery ----
export async function getGalleryImages(): Promise<GalleryImage[]> {
  const snap = await getDocs(query(collection(db, 'gallery'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as GalleryImage);
}

export async function createGalleryImage(data: Omit<GalleryImage, 'id' | 'createdAt'>) {
  return addDoc(collection(db, 'gallery'), {
    ...data,
    createdAt: Timestamp.now(),
  });
}

export async function deleteGalleryImage(id: string) {
  await deleteDoc(doc(db, 'gallery', id));
}
```

**Step 4: Storage upload helpers**

```typescript
// src/lib/storage.ts
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';
import { ALLOWED_IMAGE_TYPES } from '@/constants';

function validateImage(file: File, maxSize: number): void {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
    throw new Error('허용되지 않는 파일 형식입니다. (JPEG, PNG, WebP만 가능)');
  }
  if (file.size > maxSize) {
    throw new Error(`파일 크기가 ${Math.round(maxSize / 1024 / 1024)}MB를 초과합니다.`);
  }
}

export async function uploadImage(
  path: string,
  file: File,
  maxSize: number,
): Promise<string> {
  validateImage(file, maxSize);
  const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}

export async function deleteImage(url: string): Promise<void> {
  const storageRef = ref(storage, url);
  await deleteObject(storageRef);
}
```

**Step 5: Verify**

```bash
npx tsc --noEmit
```

---

## Task 4: Auth Context & Hooks

**Files:**
- Create: `src/hooks/useAuth.ts`
- Create: `src/components/auth/ProtectedRoute.tsx`
- Create: `src/components/auth/RoleGuard.tsx`
- Create: `src/components/auth/GoogleSignInButton.tsx`
- Create: `src/components/auth/index.ts`

**Step 1: Create useAuth hook with AuthContext**

```typescript
// src/hooks/useAuth.ts
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserProfile } from '@/lib/firestore';
import { signInWithGoogle, signOut } from '@/lib/auth';
import type { UserProfile, UserRole } from '@/types';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<User>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (uid: string) => {
    const p = await getUserProfile(uid);
    setProfile(p);
    return p;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchProfile(firebaseUser.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [fetchProfile]);

  const signIn = useCallback(async () => {
    const u = await signInWithGoogle();
    await fetchProfile(u.uid);
    return u;
  }, [fetchProfile]);

  const logout = useCallback(async () => {
    await signOut();
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.uid);
  }, [user, fetchProfile]);

  const hasRole = useCallback((roles: UserRole[]) => {
    if (!profile) return false;
    return roles.includes(profile.role);
  }, [profile]);

  const value = useMemo(() => ({
    user, profile, loading, signIn, logout, refreshProfile, hasRole,
  }), [user, profile, loading, signIn, logout, refreshProfile, hasRole]);

  return AuthContext.Provider({ value, children });
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
```

NOTE: AuthProvider uses JSX — the file should be `.tsx` or the provider should use `createElement`. During implementation, ensure this is `useAuth.tsx` and uses JSX for the Provider return.

**Step 2: Create ProtectedRoute**

```tsx
// src/components/auth/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-byuh-crimson border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
```

**Step 3: Create RoleGuard**

```tsx
// src/components/auth/RoleGuard.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types';

interface RoleGuardProps {
  roles: UserRole[];
  children: React.ReactNode;
}

export function RoleGuard({ roles, children }: RoleGuardProps) {
  const { hasRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-byuh-crimson border-t-transparent" />
      </div>
    );
  }

  if (!hasRole(roles)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
```

**Step 4: Create GoogleSignInButton**

```tsx
// src/components/auth/GoogleSignInButton.tsx
import { memo } from 'react';
import { cn } from '@/lib/cn';

interface GoogleSignInButtonProps {
  onClick: () => void;
  loading?: boolean;
  className?: string;
}

export const GoogleSignInButton = memo(function GoogleSignInButton({
  onClick,
  loading = false,
  className,
}: GoogleSignInButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={cn(
        'inline-flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-text-primary shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-byuh-crimson focus:ring-offset-2 disabled:opacity-50',
        className,
      )}
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      {loading ? '로그인 중...' : 'Google로 로그인'}
    </button>
  );
});
```

**Step 5: Create barrel export**

```typescript
// src/components/auth/index.ts
export { ProtectedRoute } from './ProtectedRoute';
export { RoleGuard } from './RoleGuard';
export { GoogleSignInButton } from './GoogleSignInButton';
```

**Step 6: Verify**

```bash
npx tsc --noEmit
```

---

## Task 5: Common Reusable Components

**Files:**
- Create: `src/components/common/Container.tsx`
- Create: `src/components/common/Button.tsx`
- Create: `src/components/common/Card.tsx`
- Create: `src/components/common/SectionHeading.tsx`
- Create: `src/components/common/ExternalLink.tsx`
- Create: `src/components/common/Modal.tsx`
- Create: `src/components/common/LoadingSpinner.tsx`
- Create: `src/components/common/index.ts`

Same as original plan Task 4, with two additions:

**Modal component:**

```tsx
// src/components/common/Modal.tsx
import { memo, useEffect } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export const Modal = memo(function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} onKeyDown={(e) => e.key === 'Escape' && onClose()} />
      <div className={cn('relative z-10 mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl', className)}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100" aria-label="닫기">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
});
```

**LoadingSpinner component:**

```tsx
// src/components/common/LoadingSpinner.tsx
import { memo } from 'react';
import { cn } from '@/lib/cn';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };

export const LoadingSpinner = memo(function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className={cn('animate-spin rounded-full border-4 border-byuh-crimson border-t-transparent', sizes[size])} />
    </div>
  );
});
```

Barrel export includes all: Container, Button, Card, SectionHeading, ExternalLink, Modal, LoadingSpinner.

---

## Task 6: Data Hooks (TanStack Query + Firestore)

**Files:**
- Create: `src/hooks/useData.ts`
- Create: `src/hooks/useImageUpload.ts`
- Create: `src/data/navigation.ts`

**Step 1: Create navigation data**

```typescript
// src/data/navigation.ts
import type { NavItem } from '@/types';

export const mainNavItems: NavItem[] = [
  { label: '소개', href: '/about' },
  { label: '행사', href: '/events' },
  { label: '소식', href: '/news' },
  { label: '갤러리', href: '/gallery' },
  { label: '동문 명부', href: '/directory', requiredRole: 'member' },
  { label: '기부', href: '/give' },
];
```

**Step 2: Create data hooks with Firestore**

```typescript
// src/hooks/useData.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { STALE_TIMES } from '@/lib/queryClient';
import {
  getEvents, createEvent, updateEvent, deleteEvent, rsvpEvent,
  getNews, createNews, updateNews, deleteNews,
  getGalleryImages, createGalleryImage, deleteGalleryImage,
  getAllUsers, updateUserRole,
} from '@/lib/firestore';
import { mainNavItems } from '@/data/navigation';
import type { Event, NewsItem, GalleryImage, UserRole } from '@/types';

// ---- Navigation ----
export function useNavigation() {
  return useQuery({
    queryKey: ['navigation'],
    queryFn: () => mainNavItems,
    staleTime: STALE_TIMES.static,
  });
}

// ---- Events ----
export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
    staleTime: STALE_TIMES.frequent,
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Event, 'id' | 'attendees' | 'createdAt' | 'updatedAt'>) => createEvent(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Event> }) => updateEvent(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
}

export function useRsvpEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, uid, attending }: { eventId: string; uid: string; attending: boolean }) =>
      rsvpEvent(eventId, uid, attending),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
}

// ---- News ----
export function useNews() {
  return useQuery({
    queryKey: ['news'],
    queryFn: getNews,
    staleTime: STALE_TIMES.frequent,
  });
}

export function useCreateNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<NewsItem, 'id' | 'createdAt' | 'updatedAt'>) => createNews(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['news'] }),
  });
}

export function useUpdateNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NewsItem> }) => updateNews(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['news'] }),
  });
}

export function useDeleteNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteNews(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['news'] }),
  });
}

// ---- Gallery ----
export function useGallery() {
  return useQuery({
    queryKey: ['gallery'],
    queryFn: getGalleryImages,
    staleTime: STALE_TIMES.moderate,
  });
}

export function useCreateGalleryImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<GalleryImage, 'id' | 'createdAt'>) => createGalleryImage(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gallery'] }),
  });
}

export function useDeleteGalleryImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteGalleryImage(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gallery'] }),
  });
}

// ---- Users ----
export function useAllUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
    staleTime: STALE_TIMES.frequent,
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, role }: { uid: string; role: UserRole }) => updateUserRole(uid, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}
```

**Step 3: Create image upload hook**

```typescript
// src/hooks/useImageUpload.ts
import { useState, useCallback } from 'react';
import { uploadImage } from '@/lib/storage';

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (path: string, file: File, maxSize: number) => {
    setUploading(true);
    setError(null);
    try {
      const url = await uploadImage(path, file, maxSize);
      return url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : '업로드 중 오류가 발생했습니다';
      setError(msg);
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  return { upload, uploading, error };
}
```

---

## Task 7: Layout Components (Header, Footer, Layout)

Same as original plan Task 5, with Header updated to:
- Show user avatar/name when logged in
- Show "로그인" button when logged out
- Show "관리" link for admin/manager roles
- Navigation items filtered by `requiredRole`

Key Header changes:

```tsx
// In Header.tsx — add auth-aware navigation
const { user, profile, logout } = useAuth();

// Filter nav items by role
const visibleNavItems = navItems.filter(item => {
  if (!item.requiredRole) return true;
  return profile && ['admin', 'manager', 'member'].includes(profile.role);
});

// Auth section in header
{user ? (
  <div className="flex items-center gap-3">
    {profile && hasRole(['admin', 'manager']) && (
      <Link to="/admin" className="text-sm text-byuh-crimson font-medium">관리</Link>
    )}
    <span className="text-sm text-text-secondary">{profile?.name}</span>
    <button onClick={logout} className="text-sm text-text-secondary hover:text-byuh-crimson">로그아웃</button>
  </div>
) : (
  <Link to="/login" className="text-sm font-medium text-byuh-crimson">로그인</Link>
)}
```

---

## Task 8: Homepage Section Components

Same as original plan Task 6 (Hero, About, Events, News, Gallery, Give, Contact), with these changes:

- **Events section** — add RSVP button (shown only when logged in)
- **Join section** → replaced by Google SSO login CTA (redirect to `/login`)
- All sections now fetch from Firestore via TanStack Query hooks instead of static data

---

## Task 9: Auth Pages (Login, Profile Setup, Profile)

**Files:**
- Create: `src/pages/LoginPage.tsx`
- Create: `src/pages/ProfileSetupPage.tsx`
- Create: `src/pages/ProfilePage.tsx`

**Step 1: LoginPage**

```tsx
// src/pages/LoginPage.tsx
import { useNavigate, useLocation } from 'react-router-dom';
import { Container } from '@/components/common';
import { GoogleSignInButton } from '@/components/auth';
import { useAuth } from '@/hooks/useAuth';
import { getUserProfile } from '@/lib/firestore';
import { SITE_NAME } from '@/constants';

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: Location })?.from?.pathname || '/';

  const handleSignIn = async () => {
    const user = await signIn();
    const profile = await getUserProfile(user.uid);
    if (!profile) {
      navigate('/profile/setup', { replace: true });
    } else {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center py-20">
      <Container className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-byuh-crimson text-xl font-bold text-white">
          BH
        </div>
        <h1 className="font-heading text-2xl font-bold">{SITE_NAME}</h1>
        <p className="mt-2 text-text-secondary">동문 네트워크에 참여하세요</p>
        <div className="mt-8 flex justify-center">
          <GoogleSignInButton onClick={handleSignIn} />
        </div>
      </Container>
    </div>
  );
}
```

**Step 2: ProfileSetupPage** — form with required (name, email, phone) + optional fields, then creates user doc in Firestore.

**Step 3: ProfilePage** — edit existing profile, same form but pre-filled.

---

## Task 10: Member Pages (Directory, Event RSVP)

**Files:**
- Create: `src/pages/DirectoryPage.tsx`

**DirectoryPage** — searchable/filterable list of all members, shows name, graduation year, company, position. Protected by `ProtectedRoute`.

**Event RSVP** — integrated into EventsPage. When logged in, each event card shows "참석" / "참석 취소" button using `useRsvpEvent` mutation.

---

## Task 11: Admin Pages (Dashboard, CRUD)

**Files:**
- Create: `src/pages/admin/AdminDashboard.tsx`
- Create: `src/pages/admin/AdminEvents.tsx`
- Create: `src/pages/admin/AdminNews.tsx`
- Create: `src/pages/admin/AdminGallery.tsx`
- Create: `src/pages/admin/AdminMembers.tsx`
- Create: `src/components/admin/EventForm.tsx`
- Create: `src/components/admin/NewsForm.tsx`
- Create: `src/components/admin/GalleryUploader.tsx`
- Create: `src/components/admin/MemberTable.tsx`

**AdminDashboard** — summary cards (총 회원, 다가오는 행사, 최근 뉴스 수), quick links to each admin section.

**AdminEvents** — table list of events + create/edit modal (EventForm) + delete confirmation. Uses `useCreateEvent`, `useUpdateEvent`, `useDeleteEvent` mutations.

**AdminNews** — same pattern as AdminEvents. Uses news mutations.

**AdminGallery** — grid of uploaded images + drag-and-drop uploader (GalleryUploader) + delete. Uses `useImageUpload` + gallery mutations.

**AdminMembers** (admin only) — MemberTable with role dropdown to change user roles. Uses `useUpdateUserRole` mutation.

All admin pages wrapped in `<ProtectedRoute>` + `<RoleGuard roles={['admin', 'manager']}>`.
AdminMembers additionally wrapped in `<RoleGuard roles={['admin']}>`.

---

## Task 12: App Routing Assembly

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`

Wire up all routes with lazy loading, ProtectedRoute, and RoleGuard:

```tsx
// src/App.tsx — key structure
<AuthProvider>
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* Public */}
          <Route index element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Member */}
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/profile/setup" element={<ProtectedRoute><ProfileSetupPage /></ProtectedRoute>} />
          <Route path="/directory" element={<ProtectedRoute><DirectoryPage /></ProtectedRoute>} />

          {/* Admin/Manager */}
          <Route path="/admin" element={<ProtectedRoute><RoleGuard roles={['admin','manager']}><AdminDashboard /></RoleGuard></ProtectedRoute>} />
          <Route path="/admin/events" element={<ProtectedRoute><RoleGuard roles={['admin','manager']}><AdminEvents /></RoleGuard></ProtectedRoute>} />
          <Route path="/admin/news" element={<ProtectedRoute><RoleGuard roles={['admin','manager']}><AdminNews /></RoleGuard></ProtectedRoute>} />
          <Route path="/admin/gallery" element={<ProtectedRoute><RoleGuard roles={['admin','manager']}><AdminGallery /></RoleGuard></ProtectedRoute>} />
          <Route path="/admin/members" element={<ProtectedRoute><RoleGuard roles={['admin']}><AdminMembers /></RoleGuard></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
</AuthProvider>
```

All page imports use `React.lazy()`.

---

## Task 13: Firebase Configuration & Security

**Files:**
- Create: `firebase.json`
- Create: `firestore.rules`
- Create: `storage.rules`
- Create: `.firebaserc`

**firebase.json** — hosting config with security headers (CSP updated to allow Firebase Auth + Google domains), SPA rewrites, caching rules.

**firestore.rules** — as defined in design doc. Role-based read/write rules.

**storage.rules** — as defined in design doc. File type + size validation.

---

## Task 14: Final Verification

**Step 1:** `npx tsc --noEmit` — no TypeScript errors
**Step 2:** `npm run build` — clean production build
**Step 3:** Check bundle sizes — vendor, firebase, router, query chunks separate
**Step 4:** Manual smoke test:
- [ ] Home page loads with all sections
- [ ] Google SSO login works
- [ ] Profile setup flow works for new user
- [ ] Member can view directory
- [ ] Member can RSVP to event
- [ ] Admin can create/edit/delete event
- [ ] Admin can create/edit/delete news
- [ ] Admin can upload/delete gallery images
- [ ] Admin can change user roles
- [ ] Manager cannot access AdminMembers
- [ ] Non-logged-in user cannot access protected routes
- [ ] Security headers present in Firebase hosting
- [ ] Responsive layout at all breakpoints
