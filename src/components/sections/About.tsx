import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, SectionHeading } from '@/components/common';
import { SECTION_IDS } from '@/constants';

export const About = memo(function About() {
  const { t } = useTranslation();

  return (
    <section id={SECTION_IDS.about} className="bg-white py-20">
      <Container>
        <SectionHeading
          title={t('about.title')}
          subtitle={t('about.subtitle')}
          viewMoreLink="/about"
          viewMoreLabel={t('common.viewMore')}
        />
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-lg leading-relaxed text-text-secondary">
            {t('about.description')}
          </p>
        </div>
      </Container>
    </section>
  );
});
