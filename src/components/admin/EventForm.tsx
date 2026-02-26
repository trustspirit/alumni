import { useState, useCallback } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/common';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useAuth } from '@/hooks/useAuth';
import { UPLOAD_LIMITS } from '@/constants';
import { Timestamp } from 'firebase/firestore';
import type { Event } from '@/types';
import { cn } from '@/lib/cn';

interface EventFormProps {
  event?: Event;
  onSubmit: (data: Omit<Event, 'id' | 'attendees' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  submitting?: boolean;
}

function sanitizeInput(value: string): string {
  return value.replace(/[<>]/g, '').trim();
}

export function EventForm({ event, onSubmit, onCancel, submitting = false }: EventFormProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { upload, uploading } = useImageUpload();

  const [formData, setFormData] = useState({
    title: event?.title || '',
    date: event?.date ? event.date.toDate().toISOString().split('T')[0] : '',
    location: event?.location || '',
    description: event?.description || '',
    imageUrl: event?.imageUrl || '',
    storagePath: event?.storagePath || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: sanitizeInput(value) }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  }, []);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await upload('events', file, UPLOAD_LIMITS.eventImage);
    if (result) setFormData(prev => ({ ...prev, imageUrl: result.url, storagePath: result.storagePath }));
  }, [upload]);

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = t('events.validation.titleRequired');
    if (!formData.date) newErrors.date = t('events.validation.dateRequired');
    if (!formData.location) newErrors.location = t('events.validation.locationRequired');
    if (!formData.description) newErrors.description = t('events.validation.descriptionRequired');
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit({
      title: formData.title,
      date: Timestamp.fromDate(new Date(formData.date)),
      location: formData.location,
      description: formData.description,
      imageUrl: formData.imageUrl || '/images/placeholder.svg',
      ...(formData.storagePath && { storagePath: formData.storagePath }),
      createdBy: user?.uid || '',
    });
  }, [formData, onSubmit, user, t]);

  const fields = [
    { field: 'title', label: t('events.eventTitle'), type: 'text' },
    { field: 'date', label: t('events.date'), type: 'date' },
    { field: 'location', label: t('events.location'), type: 'text' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {fields.map(({ field, label, type }) => (
        <div key={field}>
          <label htmlFor={`event-${field}`} className="mb-1 block text-sm font-medium">{label}</label>
          <input
            id={`event-${field}`}
            type={type}
            value={formData[field as keyof typeof formData]}
            onChange={(e) => handleChange(field, e.target.value)}
            className={cn(
              'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-byuh-crimson',
              errors[field] ? 'border-red-500' : 'border-gray-300',
            )}
          />
          {errors[field] && <p className="mt-1 text-xs text-red-500">{errors[field]}</p>}
        </div>
      ))}

      <div>
        <label htmlFor="event-description" className="mb-1 block text-sm font-medium">{t('events.description')}</label>
        <textarea
          id="event-description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
          className={cn(
            'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-byuh-crimson',
            errors.description ? 'border-red-500' : 'border-gray-300',
          )}
        />
        {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
      </div>

      <div>
        <label htmlFor="event-image" className="mb-1 block text-sm font-medium">{t('events.image')}</label>
        <input
          id="event-image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageUpload}
          className="w-full text-sm"
          disabled={uploading}
        />
        {uploading && <p className="mt-1 text-xs text-text-secondary">{t('events.uploading')}</p>}
        {formData.imageUrl && (
          <img src={formData.imageUrl} alt={t('events.preview')} className="mt-2 h-32 w-full rounded-lg object-cover" />
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" size="sm" disabled={submitting || uploading}>
          {submitting ? t('events.saving') : event ? t('common.edit') : t('common.create')}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>{t('common.cancel')}</Button>
      </div>
    </form>
  );
}
