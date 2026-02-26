import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, SectionHeading } from '@/components/common';
import { useAllUsers } from '@/hooks/useData';

export default function AboutPage() {
  const { t } = useTranslation();
  const { data: allUsers = [] } = useAllUsers();

  // Filter leadership (admin/manager) users
  const leaders = useMemo(
    () => allUsers.filter(u => u.role === 'admin' || u.role === 'manager'),
    [allUsers],
  );

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

        {leaders.length > 0 && (
          <div className="mt-16">
            <h3 className="mb-10 text-center font-heading text-2xl font-bold">{t('about.leadership')}</h3>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {leaders.map((member) => (
                <div key={member.uid} className="rounded-xl bg-surface p-6 text-center">
                  <div className="mx-auto h-32 w-32 overflow-hidden rounded-full bg-gray-200">
                    {member.profileImageUrl ? (
                      <img
                        src={member.profileImageUrl}
                        alt={member.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-byuh-crimson text-2xl font-bold text-white">
                        {member.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h4 className="mt-4 font-heading text-lg font-semibold">{member.name}</h4>
                  <p className="text-sm text-byuh-crimson">{member.role === 'admin' ? t('about.roleAdmin') : t('about.roleManager')}</p>
                  {member.company && (
                    <p className="mt-1 text-sm text-text-secondary">{member.company}{member.position ? ` · ${member.position}` : ''}</p>
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
