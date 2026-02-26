// src/App.tsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/hooks/useAuth';
import { Layout } from '@/components/layout';
import { LoadingSpinner } from '@/components/common';
import { ProtectedRoute, RoleGuard } from '@/components/auth';

// Lazy-loaded pages
const HomePage = lazy(() => import('@/pages/HomePage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const EventsPage = lazy(() => import('@/pages/EventsPage'));
const GalleryPage = lazy(() => import('@/pages/GalleryPage'));
const NewsPage = lazy(() => import('@/pages/NewsPage'));
const GivePage = lazy(() => import('@/pages/GivePage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const ProfileSetupPage = lazy(() => import('@/pages/ProfileSetupPage'));
const DirectoryPage = lazy(() => import('@/pages/DirectoryPage'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminEvents = lazy(() => import('@/pages/admin/AdminEvents'));
const AdminNews = lazy(() => import('@/pages/admin/AdminNews'));
const AdminGallery = lazy(() => import('@/pages/admin/AdminGallery'));
const AdminMembers = lazy(() => import('@/pages/admin/AdminMembers'));
const AdminLeadership = lazy(() => import('@/pages/admin/AdminLeadership'));

function PageLoader() {
  return <LoadingSpinner size="lg" className="min-h-[50vh]" />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              {/* Public Routes */}
              <Route
                index
                element={
                  <Suspense fallback={<PageLoader />}>
                    <HomePage />
                  </Suspense>
                }
              />
              <Route
                path="/about"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <AboutPage />
                  </Suspense>
                }
              />
              <Route
                path="/events"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <EventsPage />
                  </Suspense>
                }
              />
              <Route
                path="/gallery"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <GalleryPage />
                  </Suspense>
                }
              />
              <Route
                path="/news"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <NewsPage />
                  </Suspense>
                }
              />
              <Route
                path="/give"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <GivePage />
                  </Suspense>
                }
              />
              <Route
                path="/login"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <LoginPage />
                  </Suspense>
                }
              />

              {/* Member Routes (requires authentication) */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <ProfilePage />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/setup"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <ProfileSetupPage />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/directory"
                element={
                  <ProtectedRoute>
                    <RoleGuard roles={['admin', 'manager']}>
                      <Suspense fallback={<PageLoader />}>
                        <DirectoryPage />
                      </Suspense>
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />

              {/* Admin/Manager Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <RoleGuard roles={['admin', 'manager']}>
                      <Suspense fallback={<PageLoader />}>
                        <AdminDashboard />
                      </Suspense>
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/events"
                element={
                  <ProtectedRoute>
                    <RoleGuard roles={['admin', 'manager']}>
                      <Suspense fallback={<PageLoader />}>
                        <AdminEvents />
                      </Suspense>
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/news"
                element={
                  <ProtectedRoute>
                    <RoleGuard roles={['admin', 'manager']}>
                      <Suspense fallback={<PageLoader />}>
                        <AdminNews />
                      </Suspense>
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/gallery"
                element={
                  <ProtectedRoute>
                    <RoleGuard roles={['admin', 'manager']}>
                      <Suspense fallback={<PageLoader />}>
                        <AdminGallery />
                      </Suspense>
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/members"
                element={
                  <ProtectedRoute>
                    <RoleGuard roles={['admin']}>
                      <Suspense fallback={<PageLoader />}>
                        <AdminMembers />
                      </Suspense>
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/leadership"
                element={
                  <ProtectedRoute>
                    <RoleGuard roles={['admin', 'manager']}>
                      <Suspense fallback={<PageLoader />}>
                        <AdminLeadership />
                      </Suspense>
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
