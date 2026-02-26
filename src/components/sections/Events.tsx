import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, SectionHeading, Card, Button } from '@/components/common';
import { useEvents, useRsvpEvent } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';
import { SECTION_IDS } from '@/constants';
import type { Timestamp } from 'firebase/firestore';

function formatDate(ts: Timestamp, locale: string): string {
  return ts.toDate().toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getMapEmbedUrl(location: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`;
}

interface EventsSectionProps {
  limit?: number;
  showRsvp?: boolean;
}

export const Events = memo(function Events({ limit = 3, showRsvp = false }: EventsSectionProps) {
  const { t, i18n } = useTranslation();
  const { data: allEvents = [] } = useEvents();
  const { user } = useAuth();
  const rsvpMutation = useRsvpEvent();

  const displayEvents = useMemo(
    () => allEvents.slice(0, limit),
    [allEvents, limit],
  );

  const handleRsvp = (eventId: string, attending: boolean) => {
    if (!user) return;
    rsvpMutation.mutate({ eventId, uid: user.uid, attending });
  };

  return (
    <section id={SECTION_IDS.events} className="bg-surface py-20">
      <Container>
        <SectionHeading
          title={t('events.title')}
          subtitle={t('events.subtitle')}
          viewMoreLink="/events"
          viewMoreLabel={t('common.viewMore')}
        />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {displayEvents.map((event) => {
            const isAttending = user ? event.attendees.includes(user.uid) : false;
            return (
              <div key={event.id}>
                <Card
                  title={event.title}
                  description={event.description}
                  imageUrl={event.imageUrl}
                  meta={`${formatDate(event.date, i18n.language)} · ${event.location}`}
                />
                {showRsvp && (
                  <>
                    <div className="mt-3 overflow-hidden rounded-lg">
                      <iframe
                        title={`Map: ${event.location}`}
                        src={getMapEmbedUrl(event.location)}
                        className="h-48 w-full border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        allowFullScreen
                      />
                    </div>
                    {user && (
                      <div className="mt-2 text-center">
                        <Button
                          variant={isAttending ? 'outline' : 'primary'}
                          size="sm"
                          onClick={() => handleRsvp(event.id, !isAttending)}
                          disabled={rsvpMutation.isPending}
                        >
                          {isAttending ? t('events.cancelRsvp') : t('events.rsvp')}
                        </Button>
                        <span className="ml-2 text-sm text-text-secondary">
                          {t('events.attendees', { count: event.attendees.length })}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
});
