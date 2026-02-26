import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, SectionHeading, Button } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';
import { SECTION_IDS } from '@/constants';

export const Join = memo(function Join() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <section id={SECTION_IDS.join} className="bg-white py-20">
      <Container className="text-center">
        <SectionHeading
          title={t('join.title')}
          subtitle={t('join.subtitle')}
        />
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-text-secondary">
          {t('join.description')}
        </p>
        <div className="mt-8">
          {user ? (
            <Button to="/profile" variant="primary" size="lg">
              {t('join.viewProfile')}
            </Button>
          ) : (
            <Button to="/login" variant="primary" size="lg">
              {t('join.signUpGoogle')}
            </Button>
          )}
        </div>
      </Container>
    </section>
  );
});
