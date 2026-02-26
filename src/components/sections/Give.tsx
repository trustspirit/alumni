import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, SectionHeading, Button } from '@/components/common';
import { SECTION_IDS, EXTERNAL_LINKS } from '@/constants';

export const Give = memo(function Give() {
  const { t } = useTranslation();

  return (
    <section id={SECTION_IDS.give} className="relative overflow-hidden py-24 text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/byuh-dusk.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/55" />
      <Container className="relative z-10 text-center">
        <SectionHeading
          title={t('give.title')}
          subtitle={t('give.subtitle')}
          className="text-white [&_h2]:text-white [&_p]:text-white/80"
        />
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white/85">
          {t('give.description')}
        </p>
        <div className="mt-8">
          <Button href={EXTERNAL_LINKS.give} variant="secondary" size="lg">
            {t('give.donateBtn')}
          </Button>
        </div>
      </Container>
    </section>
  );
});
