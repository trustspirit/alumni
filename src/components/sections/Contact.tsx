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
    <section id={SECTION_IDS.contact} className="bg-surface py-20">
      <Container className="text-center">
        <SectionHeading
          title={t('contact.title')}
          subtitle={t('contact.subtitle')}
        />
        <div className="mx-auto max-w-md space-y-6">
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
            <div className="flex justify-center gap-4">
              {contactInfo.socialLinks.map((link) => (
                <ExternalLink
                  key={link.platform}
                  href={link.url}
                  className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm shadow-sm transition-shadow hover:shadow-md"
                >
                  {link.platform}
                </ExternalLink>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
});
