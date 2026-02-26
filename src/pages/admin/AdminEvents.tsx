import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, SectionHeading, Button, Modal } from '@/components/common';
import { EventForm } from '@/components/admin';
import { useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent } from '@/hooks/useData';
import type { Event } from '@/types';
import type { Timestamp } from 'firebase/firestore';

function formatDate(ts: Timestamp, locale: string): string {
  return ts.toDate().toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US');
}

export default function AdminEvents() {
  const { t, i18n } = useTranslation();
  const { data: events = [] } = useEvents();
  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();
  const deleteMutation = useDeleteEvent();
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreate = useCallback((data: Omit<Event, 'id' | 'attendees' | 'createdAt' | 'updatedAt'>) => {
    createMutation.mutate(data, { onSuccess: () => setIsCreateModalOpen(false) });
  }, [createMutation]);

  const handleUpdate = useCallback((data: Omit<Event, 'id' | 'attendees' | 'createdAt' | 'updatedAt'>) => {
    if (!editingEvent) return;
    updateMutation.mutate({ id: editingEvent.id, data }, { onSuccess: () => setEditingEvent(null) });
  }, [editingEvent, updateMutation]);

  const handleDelete = useCallback((id: string) => {
    if (window.confirm(t('admin.confirmDeleteEvent'))) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation, t]);

  return (
    <div className="py-20">
      <Container>
        <div className="mb-8 flex items-center justify-between">
          <SectionHeading title={t('events.manageTitle')} className="mb-0" />
          <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>{t('events.newEvent')}</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-xs uppercase text-text-secondary">
              <tr>
                <th className="px-4 py-3">{t('events.eventTitle')}</th>
                <th className="px-4 py-3">{t('events.date')}</th>
                <th className="px-4 py-3">{t('events.location')}</th>
                <th className="px-4 py-3">{t('events.attendeeCount')}</th>
                <th className="px-4 py-3">{t('events.manage')}</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b border-gray-100 hover:bg-surface">
                  <td className="px-4 py-3 font-medium">{event.title}</td>
                  <td className="px-4 py-3 text-text-secondary">{formatDate(event.date, i18n.language)}</td>
                  <td className="px-4 py-3 text-text-secondary">{event.location}</td>
                  <td className="px-4 py-3 text-text-secondary">{event.attendees.length}</td>
                  <td className="flex gap-2 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setEditingEvent(event)}
                      className="text-xs text-byuh-crimson hover:underline"
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(event.id)}
                      className="text-xs text-red-500 hover:underline"
                      disabled={deleteMutation.isPending}
                    >
                      {t('common.delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title={t('admin.createEvent')}>
          <EventForm onSubmit={handleCreate} onCancel={() => setIsCreateModalOpen(false)} submitting={createMutation.isPending} />
        </Modal>

        <Modal isOpen={!!editingEvent} onClose={() => setEditingEvent(null)} title={t('admin.editEvent')}>
          {editingEvent && (
            <EventForm event={editingEvent} onSubmit={handleUpdate} onCancel={() => setEditingEvent(null)} submitting={updateMutation.isPending} />
          )}
        </Modal>
      </Container>
    </div>
  );
}
