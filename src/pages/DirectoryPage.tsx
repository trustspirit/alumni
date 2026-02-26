import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, SectionHeading, ExternalLink } from '@/components/common';
import { useAllUsers } from '@/hooks/useData';

export default function DirectoryPage() {
  const { t } = useTranslation();
  const { data: allUsers = [], isLoading } = useAllUsers();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return allUsers;
    const q = searchQuery.toLowerCase();
    return allUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        (u.company?.toLowerCase().includes(q)) ||
        (u.graduationYear?.includes(q)),
    );
  }, [allUsers, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-byuh-crimson border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="py-20">
      <Container>
        <SectionHeading
          title={t('directory.title')}
          subtitle={t('directory.subtitle', { count: allUsers.length })}
        />

        <div className="mx-auto mb-10 max-w-md">
          <input
            type="text"
            placeholder={t('directory.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-byuh-crimson"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <div key={user.uid} className="rounded-xl bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-byuh-crimson text-sm font-bold text-white">
                  {user.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-heading text-sm font-semibold">{user.name}</h3>
                  {user.graduationYear && (
                    <p className="text-xs text-text-secondary">{t('directory.classOf', { year: user.graduationYear })}</p>
                  )}
                </div>
              </div>
              {(user.company || user.position) && (
                <p className="mt-3 text-sm text-text-secondary">
                  {[user.company, user.position].filter(Boolean).join(' · ')}
                </p>
              )}
              {user.linkedIn && (
                <ExternalLink href={user.linkedIn} className="mt-2 inline-block text-xs">
                  LinkedIn
                </ExternalLink>
              )}
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <p className="text-center text-text-secondary">{t('common.noResults')}</p>
        )}
      </Container>
    </div>
  );
}
