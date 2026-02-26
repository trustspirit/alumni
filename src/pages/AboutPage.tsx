import { useTranslation } from 'react-i18next';
import { Container, SectionHeading } from '@/components/common';
import { useLeadership } from '@/hooks/useData';

export default function AboutPage() {
  const { t } = useTranslation();
  const { data: entries = [] } = useLeadership();

  return (
    <div className="py-20">
      <Container>
        <SectionHeading
          title={t('about.title')}
          subtitle={t('about.subtitle')}
        />

        <div className="mx-auto max-w-3xl space-y-6 text-lg leading-relaxed text-text-secondary">
          <p>{t('about.detailP1')}</p>
          <p>{t('about.detailP2')}</p>
        </div>

        {entries.length > 0 && (
          <div className="mt-16">
            <h3 className="mb-10 text-center font-heading text-2xl font-bold">{t('about.leadership')}</h3>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {entries.filter(e => e.name).map((entry) => (
                <div key={entry.id} className="rounded-xl bg-surface p-6 text-center">
                  <div className="mx-auto h-32 w-32 overflow-hidden rounded-full bg-gray-200">
                    {entry.profileImageUrl ? (
                      <img
                        src={entry.profileImageUrl}
                        alt={entry.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-byuh-crimson text-2xl font-bold text-white">
                        {entry.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h4 className="mt-4 font-heading text-lg font-semibold">{entry.name}</h4>
                  <p className="text-sm font-medium text-byuh-crimson">{entry.title}</p>
                  {entry.graduationYear && (
                    <p className="mt-1 text-xs text-text-secondary">{t('directory.classOf', { year: entry.graduationYear })}</p>
                  )}
                  {(entry.company || entry.position) && (
                    <p className="text-xs text-text-secondary">
                      {[entry.company, entry.position].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  {entry.description && (
                    <p className="mt-2 text-sm text-text-secondary">{entry.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
