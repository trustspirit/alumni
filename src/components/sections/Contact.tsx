import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, SectionHeading, ExternalLink } from '@/components/common';
import { SECTION_IDS } from '@/constants';

const contactInfo = {
  email: 'korea@byuhalumni.org',
  socialLinks: [
    { platform: 'Instagram', url: 'https://instagram.com/byuhkorea' },
    { platform: 'KakaoTalk', url: '#' },
  ],
};

export const Contact = memo(function Contact() {
  const { t } = useTranslation();

  return (
    <section id={SECTION_IDS.contact} className="bg-white py-20">
      <Container>
        <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2">
          <div className="text-center md:text-left">
            <SectionHeading
              title={t('contact.title')}
              subtitle={t('contact.subtitle')}
              className="md:[&_h2]:text-left md:[&_p]:text-left"
            />
            <div className="space-y-6">
              <div>
                <h3 className="mb-2 font-heading text-sm font-semibold uppercase tracking-wider text-text-secondary">
                  {t('contact.email')}
                </h3>
                <ExternalLink href={`mailto:${contactInfo.email}`} className="text-lg">
                  {contactInfo.email}
                </ExternalLink>
              </div>
              <div>
                <h3 className="mb-3 font-heading text-sm font-semibold uppercase tracking-wider text-text-secondary">
                  {t('contact.sns')}
                </h3>
                <div className="flex justify-center gap-4 md:justify-start">
                  {contactInfo.socialLinks.map((link) => (
                    <ExternalLink
                      key={link.platform}
                      href={link.url}
                      className="flex items-center gap-2 rounded-lg bg-surface px-4 py-2 text-sm shadow-sm transition-shadow hover:shadow-md"
                    >
                      {link.platform}
                    </ExternalLink>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl">
            <img
              src="/images/byuh-flagcircle.jpg"
              alt="BYUH Welcome Center"
              className="aspect-[4/3] w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </Container>
    </section>
  );
});
