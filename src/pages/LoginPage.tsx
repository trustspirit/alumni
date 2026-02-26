// src/pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/common';
import { GoogleSignInButton } from '@/components/auth';
import { useAuth } from '@/hooks/useAuth';
import { getUserProfile } from '@/lib/firestore';
import { SITE_NAME } from '@/constants';

export default function LoginPage() {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: Location })?.from?.pathname || '/';

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
    <div className="flex min-h-[60vh] items-center justify-center py-20">
      <Container className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-byuh-crimson text-xl font-bold text-white">
          BH
        </div>
        <h1 className="font-heading text-2xl font-bold">{SITE_NAME}</h1>
        <p className="mt-2 text-text-secondary">{t('auth.joinNetwork')}</p>
        {error && (
          <p className="mt-4 text-sm text-red-500">{error}</p>
        )}
        <div className="mt-8 flex justify-center">
          <GoogleSignInButton onClick={handleSignIn} loading={loading} />
        </div>
      </Container>
    </div>
  );
}
