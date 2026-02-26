import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, ExternalLink } from '@/components/common';
import { EXTERNAL_LINKS } from '@/constants';

export const Footer = memo(function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { label: t('nav.about'), to: '/about' },
    { label: t('nav.events'), to: '/events' },
    { label: t('nav.gallery'), to: '/gallery' },
  ];

  const externalLinks = [
    { label: t('footer.byuhLink'), href: EXTERNAL_LINKS.byuh },
    { label: t('footer.byuhAlumniLink'), href: EXTERNAL_LINKS.byuhAlumni },
    { label: t('footer.donate'), href: EXTERNAL_LINKS.give },
  ];

  return (
    <footer className="bg-text-primary text-white">
      <Container className="py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-4 font-heading text-lg font-bold">{t('auth.siteName')}</h3>
            <p className="text-sm leading-relaxed text-gray-300">
              {t('footer.description')}
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wider text-gray-400">
              {t('footer.quickLinks')}
            </h4>
            <nav className="flex flex-col gap-2">
              {footerLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm text-gray-300 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wider text-gray-400">
              {t('footer.relatedLinks')}
            </h4>
            <nav className="flex flex-col gap-2">
              {externalLinks.map((link) => (
                <ExternalLink
                  key={link.href}
                  href={link.href}
                  className="text-sm text-gray-300 hover:text-white"
                >
                  {link.label}
                </ExternalLink>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-700 pt-6 text-center text-sm text-gray-400">
          &copy; {currentYear} {t('auth.siteName')}. {t('footer.rights')}
        </div>
      </Container>
    </footer>
  );
});
