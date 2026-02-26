import { useState, useCallback, useRef } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Textarea } from '@/components/common';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useAuth } from '@/hooks/useAuth';
import { UPLOAD_LIMITS } from '@/constants';
import { Timestamp } from 'firebase/firestore';
import type { Event } from '@/types';

interface EventFormProps {
  event?: Event;
  onSubmit: (data: Omit<Event, 'id' | 'attendees' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  submitting?: boolean;
}

export function EventForm({ event, onSubmit, onCancel, submitting = false }: EventFormProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { upload, uploading, error: uploadError } = useImageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setFormData(prev => ({ ...prev, [field]: value }));
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input
        id="event-title"
        type="text"
        label={t('events.eventTitle')}
        value={formData.title}
        onChange={(v) => handleChange('title', v)}
        error={errors.title}
      />
      <Input
        id="event-date"
        type="date"
        label={t('events.date')}
        value={formData.date}
        onChange={(v) => handleChange('date', v)}
        error={errors.date}
      />
      <Input
        id="event-location"
        type="text"
        label={t('events.location')}
        value={formData.location}
        onChange={(v) => handleChange('location', v)}
        error={errors.location}
        placeholder={t('events.locationPlaceholder')}
      />
      {formData.location.trim().length >= 2 && (
        <div className="overflow-hidden rounded-lg">
          <iframe
            title="Map preview"
            src={`https://www.google.com/maps?q=${encodeURIComponent(formData.location)}&output=embed`}
            className="h-48 w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}

      <Textarea
        id="event-description"
        label={t('events.description')}
        value={formData.description}
        onChange={(v) => handleChange('description', v)}
        rows={3}
        error={errors.description}
      />

      <div>
        <label htmlFor="event-image" className="mb-1 block text-sm font-medium text-text-primary">
          {t('events.image')}
          <span className="ml-1 text-xs font-normal text-text-secondary">(max 600KB)</span>
        </label>
        <input
          ref={fileInputRef}
          id="event-image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageUpload}
          className="hidden"
          disabled={uploading}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-text-secondary transition-colors hover:border-byuh-crimson hover:text-byuh-crimson disabled:opacity-50"
        >
          {uploading ? t('events.uploading') : t('events.chooseFile')}
        </button>
        {uploadError && <p className="mt-1 text-xs text-red-500">{uploadError}</p>}
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
