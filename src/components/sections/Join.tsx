import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, SectionHeading, Button } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';
import { SECTION_IDS } from '@/constants';

export const Join = memo(function Join() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <section id={SECTION_IDS.join} className="relative overflow-hidden py-24">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/byuh-walkway.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/50" />
      <Container className="relative z-10 text-center text-white">
        <SectionHeading
          title={t('join.title')}
          subtitle={t('join.subtitle')}
          className="[&_h2]:text-white [&_p]:text-white/80"
        />
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white/85">
          {t('join.description')}
        </p>
        <div className="mt-8">
          {user ? (
            <Button to="/profile" variant="secondary" size="lg">
              {t('join.viewProfile')}
            </Button>
          ) : (
            <Button to="/login" variant="secondary" size="lg">
              {t('join.signUpGoogle')}
            </Button>
          )}
        </div>
      </Container>
    </section>
  );
});
