import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, SectionHeading, Card } from '@/components/common';
import { useNews } from '@/hooks/useData';
import { SECTION_IDS } from '@/constants';
import type { Timestamp } from 'firebase/firestore';

function formatDate(ts: Timestamp): string {
  return ts.toDate().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

interface NewsSectionProps {
  limit?: number;
}

export const News = memo(function News({ limit = 3 }: NewsSectionProps) {
  const { t } = useTranslation();
  const { data: allNews = [] } = useNews();
  const displayNews = useMemo(() => allNews.slice(0, limit), [allNews, limit]);

  return (
    <section id={SECTION_IDS.news} className="bg-white py-20">
      <Container>
        <SectionHeading
          title={t('news.title')}
          subtitle={t('news.subtitle')}
        />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {displayNews.map((item) => (
            <Card
              key={item.id}
              title={item.title}
              description={item.summary}
              imageUrl={item.imageUrl}
              meta={formatDate(item.date)}
              link={item.link}
            />
          ))}
        </div>
      </Container>
    </section>
  );
});
