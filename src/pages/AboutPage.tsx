import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, SectionHeading } from '@/components/common';
import { useLeadership, useAllUsers } from '@/hooks/useData';

export default function AboutPage() {
  const { t } = useTranslation();
  const { data: entries = [] } = useLeadership();
  const { data: allUsers = [] } = useAllUsers();

  const usersMap = useMemo(() => {
    const map = new Map<string, typeof allUsers[number]>();
    allUsers.forEach(u => map.set(u.uid, u));
    return map;
  }, [allUsers]);

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
              {entries.map((entry) => {
                const user = usersMap.get(entry.uid);
                if (!user) return null;
                return (
                  <div key={entry.id} className="rounded-xl bg-surface p-6 text-center">
                    <div className="mx-auto h-32 w-32 overflow-hidden rounded-full bg-gray-200">
                      {user.profileImageUrl ? (
                        <img
                          src={user.profileImageUrl}
                          alt={user.name}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-byuh-crimson text-2xl font-bold text-white">
                          {user.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <h4 className="mt-4 font-heading text-lg font-semibold">{user.name}</h4>
                    <p className="text-sm font-medium text-byuh-crimson">{entry.title}</p>
                    {user.graduationYear && (
                      <p className="mt-1 text-xs text-text-secondary">{t('directory.classOf', { year: user.graduationYear })}</p>
                    )}
                    {(user.company || user.position) && (
                      <p className="text-xs text-text-secondary">
                        {[user.company, user.position].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    {entry.description && (
                      <p className="mt-2 text-sm text-text-secondary">{entry.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
