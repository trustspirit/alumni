import { memo, useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, SectionHeading, Card, Button, Input, Modal } from '@/components/common';
import { useEvents, useRsvpEvent } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';
import { SECTION_IDS } from '@/constants';
import type { Timestamp } from 'firebase/firestore';
import type { Event } from '@/types';

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
  showViewMore?: boolean;
}

export const Events = memo(function Events({ limit = 3, showRsvp = false, showViewMore = true }: EventsSectionProps) {
  const { t, i18n } = useTranslation();
  const { data: allEvents = [] } = useEvents();
  const { user } = useAuth();
  const rsvpMutation = useRsvpEvent();
  const [rsvpModal, setRsvpModal] = useState<Event | null>(null);
  const [rsvpAnswers, setRsvpAnswers] = useState<string[]>([]);

  const displayEvents = useMemo(
    () => allEvents.slice(0, limit),
    [allEvents, limit],
  );

  const handleRsvpClick = useCallback((event: Event) => {
    if (!user) return;
    const isAttending = event.attendees.includes(user.uid);

    if (isAttending) {
      rsvpMutation.mutate({ eventId: event.id, uid: user.uid, attending: false });
      return;
    }

    if (event.rsvpQuestions && event.rsvpQuestions.length > 0) {
      setRsvpAnswers(new Array(event.rsvpQuestions.length).fill(''));
      setRsvpModal(event);
    } else {
      rsvpMutation.mutate({ eventId: event.id, uid: user.uid, attending: true });
    }
  }, [user, rsvpMutation]);

  const handleRsvpSubmit = useCallback(() => {
    if (!user || !rsvpModal) return;
    rsvpMutation.mutate(
      { eventId: rsvpModal.id, uid: user.uid, attending: true, answers: rsvpAnswers },
      { onSuccess: () => setRsvpModal(null) },
    );
  }, [user, rsvpModal, rsvpAnswers, rsvpMutation]);

  return (
    <section id={SECTION_IDS.events} className="bg-surface py-20">
      <Container>
        <SectionHeading
          title={t('events.title')}
          subtitle={t('events.subtitle')}
          viewMoreLink={showViewMore ? '/events' : undefined}
          viewMoreLabel={showViewMore ? t('common.viewMore') : undefined}
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
                  meta={`${formatDate(event.date, i18n.language)}${event.time ? ` ${event.time}` : ''} · ${event.location}`}
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
                          onClick={() => handleRsvpClick(event)}
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

      <Modal
        isOpen={!!rsvpModal}
        onClose={() => setRsvpModal(null)}
        title={t('events.rsvp')}
      >
        {rsvpModal?.rsvpQuestions && (
          <div className="space-y-4">
            {rsvpModal.rsvpQuestions.map((question, i) => (
              <Input
                key={i}
                label={question}
                value={rsvpAnswers[i] || ''}
                onChange={(v) => setRsvpAnswers(prev => prev.map((old, j) => j === i ? v : old))}
              />
            ))}
            <div className="flex gap-3 pt-2">
              <Button
                size="sm"
                onClick={handleRsvpSubmit}
                disabled={rsvpMutation.isPending}
              >
                {rsvpMutation.isPending ? t('events.saving') : t('events.rsvp')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRsvpModal(null)}
                disabled={rsvpMutation.isPending}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
});
