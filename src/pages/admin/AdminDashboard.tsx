import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, SectionHeading } from '@/components/common';
import { useEvents, useNews, useGallery, useAllUsers } from '@/hooks/useData';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { data: events = [] } = useEvents();
  const { data: news = [] } = useNews();
  const { data: gallery = [] } = useGallery();
  const { data: users = [] } = useAllUsers();

  const adminLinks = [
    { to: '/admin/events', label: t('admin.manageEvents'), icon: '📅' },
    { to: '/admin/news', label: t('admin.manageNews'), icon: '📰' },
    { to: '/admin/gallery', label: t('admin.manageGallery'), icon: '🖼️' },
    { to: '/admin/leadership', label: t('admin.manageLeadership'), icon: '⭐' },
    { to: '/admin/members', label: t('admin.manageMembers'), icon: '👥' },
  ];

  const stats = [
    { label: t('admin.totalMembers'), value: users.length },
    { label: t('admin.eventsLabel'), value: events.length },
    { label: t('admin.newsLabel'), value: news.length },
    { label: t('admin.galleryLabel'), value: gallery.length },
  ];

  return (
    <div className="py-20">
      <Container>
        <SectionHeading title={t('admin.dashboard')} subtitle={t('admin.dashboardSubtitle')} />

        <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl bg-white p-6 text-center shadow-sm">
              <p className="text-3xl font-bold text-byuh-crimson">{stat.value}</p>
              <p className="mt-1 text-sm text-text-secondary">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {adminLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex flex-col items-center gap-2 rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="text-3xl">{link.icon}</span>
              <span className="font-heading text-sm font-semibold">{link.label}</span>
            </Link>
          ))}
        </div>
      </Container>
    </div>
  );
}
