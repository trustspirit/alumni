import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserProfile, updateUserProfile } from '@/lib/firestore';
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const p = await getUserProfile(firebaseUser.uid);
        // Sync Google photo if profile exists but has no custom photo
        if (p && !p.profileImageUrl && firebaseUser.photoURL) {
          await updateUserProfile(firebaseUser.uid, { profileImageUrl: firebaseUser.photoURL });
          p.profileImageUrl = firebaseUser.photoURL;
        }
        setUser(firebaseUser);
        setProfile(p);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = useCallback(async () => {
    const u = await signInWithGoogle();
    // Let onAuthStateChanged handle setting user + profile atomically.
    // Return the user so callers (e.g. LoginPage) can use it immediately.
    return u;
  }, []);

  const logout = useCallback(async () => {
    await signOut();
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const p = await getUserProfile(user.uid);
      setProfile(p);
    }
  }, [user]);

  const hasRole = useCallback(
    (roles: UserRole[]) => {
      if (!profile) return false;
      return roles.includes(profile.role);
    },
    [profile],
  );

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      signIn,
      logout,
      refreshProfile,
      hasRole,
    }),
    [user, profile, loading, signIn, logout, refreshProfile, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
