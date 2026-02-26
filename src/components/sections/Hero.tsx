import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Button, YouTubeBackground } from '@/components/common';
import { SECTION_IDS } from '@/constants';

export const Hero = memo(function Hero() {
  const { t } = useTranslation();

  return (
    <section id={SECTION_IDS.hero} className="relative -mt-16 overflow-hidden md:-mt-20">
      <YouTubeBackground videoId="js19LLTqJcE" />
      <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/40 to-transparent" />
      <Container className="relative z-10 flex min-h-[85vh] items-center py-32 md:py-44">
        <div className="max-w-xl text-white">
          <img
            src="/images/byuh-monogram-white.png"
            alt="BYUH"
            className="h-14 object-contain md:h-16"
          />
          <h1 className="mt-6 font-heading text-4xl font-bold leading-tight md:text-6xl">
            {t('hero.title1')}
            <br />
            <span className="text-byuh-gold-light">{t('hero.title2')}</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/80 md:text-lg">
            {t('hero.subtitle')}
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button to="/login" variant="secondary" size="lg">
              {t('hero.joinBtn')}
            </Button>
            <Button to="/events" variant="outline" size="lg" className="border-white/60 text-white hover:bg-white hover:text-byuh-crimson">
              {t('hero.eventsBtn')}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
});
