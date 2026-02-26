import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Button } from '@/components/common';
import { SECTION_IDS } from '@/constants';

export const Hero = memo(function Hero() {
  const { t } = useTranslation();

  return (
    <section id={SECTION_IDS.hero} className="relative bg-byuh-crimson py-24 md:py-36">
      <div className="absolute inset-0 bg-gradient-to-br from-byuh-crimson to-byuh-crimson-dark" />
      <Container className="relative z-10 text-center text-white">
        <h1 className="font-heading text-4xl font-bold leading-tight md:text-6xl">
          {t('hero.title1')}
          <br />
          <span className="text-byuh-gold-light">{t('hero.title2')}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/90 md:text-xl">
          {t('hero.subtitle')}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button to="/login" variant="secondary" size="lg">
            {t('hero.joinBtn')}
          </Button>
          <Button to="/events" variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-byuh-crimson">
            {t('hero.eventsBtn')}
          </Button>
        </div>
      </Container>
    </section>
  );
});
