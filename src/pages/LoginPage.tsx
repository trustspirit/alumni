// src/pages/LoginPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GoogleSignInButton } from '@/components/auth';
import { useAuth } from '@/hooks/useAuth';
import { getUserProfile } from '@/lib/firestore';

export default function LoginPage() {
  const { t } = useTranslation();
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: Location })?.from?.pathname || '/';

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, navigate, from]);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await signIn();
      const profile = await getUserProfile(user.uid);
      if (!profile) {
        navigate('/profile/setup', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : t('auth.signInError');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="-mt-16 flex min-h-screen md:-mt-20">
      {/* Left: Campus Image */}
      <div
        className="hidden bg-cover bg-center md:block md:w-1/2"
        style={{ backgroundImage: "url('/images/byuh-welcome-center.jpg')" }}
      />

      {/* Right: Login Form */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-24 md:w-1/2 md:py-0">
        <div className="w-full max-w-sm">
          <img
            src="/images/byuh-monogram-white.png"
            alt="BYUH"
            className="mx-auto h-16 object-contain brightness-0"
          />
          <h1 className="mt-4 text-center font-heading text-xl font-bold text-text-primary">
            {t('auth.siteName')}
          </h1>
          <p className="mt-1 text-center text-sm text-text-secondary">
            {t('auth.joinNetwork')}
          </p>

          {error && (
            <p className="mt-6 text-center text-sm text-red-500">{error}</p>
          )}

          <div className="mt-10 flex justify-center">
            <GoogleSignInButton onClick={handleSignIn} loading={loading} />
          </div>

          <p className="mt-10 text-center text-xs text-text-secondary/50">
            {t('auth.universityName')}
          </p>
        </div>
      </div>
    </div>
  );
}
