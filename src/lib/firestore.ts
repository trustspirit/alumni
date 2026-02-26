import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, deleteField,
  query, orderBy, Timestamp, arrayUnion, arrayRemove, setDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { writeBatch } from 'firebase/firestore';
import type { UserProfile, Event, NewsItem, GalleryImage, LeadershipEntry, UserRole } from '@/types';

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

export async function updateUserProfile(uid: string, data: Omit<Partial<UserProfile>, 'role' | 'uid' | 'createdAt'>) {
  await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: Timestamp.now() });
}

// ---- Leadership ----
export async function getLeadershipEntries(): Promise<LeadershipEntry[]> {
  const snap = await getDocs(query(collection(db, 'leadership'), orderBy('order')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as LeadershipEntry);
}

export async function addLeadershipEntry(data: Omit<LeadershipEntry, 'id' | 'createdAt'>) {
  return addDoc(collection(db, 'leadership'), { ...data, createdAt: Timestamp.now() });
}

export async function updateLeadershipEntry(id: string, data: Partial<LeadershipEntry>) {
  await updateDoc(doc(db, 'leadership', id), data);
}

export async function deleteLeadershipEntry(id: string) {
  await deleteDoc(doc(db, 'leadership', id));
}

export async function reorderLeadership(entries: { id: string; order: number }[]) {
  const batch = writeBatch(db);
  for (const entry of entries) {
    batch.update(doc(db, 'leadership', entry.id), { order: entry.order });
  }
  await batch.commit();
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

export async function rsvpEvent(eventId: string, uid: string, attending: boolean, answers?: string[]) {
  const ref = doc(db, 'events', eventId);
  if (attending) {
    await updateDoc(ref, {
      attendees: arrayUnion(uid),
      ...(answers && { [`rsvpResponses.${uid}`]: answers }),
    });
  } else {
    await updateDoc(ref, {
      attendees: arrayRemove(uid),
      [`rsvpResponses.${uid}`]: deleteField(),
    });
  }
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
