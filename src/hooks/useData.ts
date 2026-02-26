import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { STALE_TIMES } from '@/lib/queryClient';
import {
  getEvents, createEvent, updateEvent, deleteEvent, rsvpEvent,
  getNews, createNews, updateNews, deleteNews,
  getGalleryImages, createGalleryImage, deleteGalleryImage,
  getLeadership, getAllUsers, updateUserRole,
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
    mutationFn: ({ eventId, uid, attending, answers }: { eventId: string; uid: string; attending: boolean; answers?: string[] }) =>
      rsvpEvent(eventId, uid, attending, answers),
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
export function useLeadership() {
  return useQuery({
    queryKey: ['leadership'],
    queryFn: getLeadership,
    staleTime: STALE_TIMES.moderate,
  });
}

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
