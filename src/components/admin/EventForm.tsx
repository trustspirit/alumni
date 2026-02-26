import { useState, useCallback, useRef, useEffect } from 'react';
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
  const previewUrlRef = useRef<string | null>(null);

  const [formData, setFormData] = useState({
    title: event?.title || '',
    date: event?.date ? event.date.toDate().toISOString().split('T')[0] : '',
    time: event?.time || '',
    location: event?.location || '',
    description: event?.description || '',
    imageUrl: event?.imageUrl || '',
    storagePath: event?.storagePath || '',
  });
  const [rsvpQuestions, setRsvpQuestions] = useState<string[]>(event?.rsvpQuestions || []);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(event?.imageUrl || null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const handleChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > UPLOAD_LIMITS.eventImage) {
      setErrors(prev => ({ ...prev, image: t('events.imageTooLarge') }));
      return;
    }

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setPreviewUrl(url);
    setPendingFile(file);
    setErrors(prev => ({ ...prev, image: '' }));
  }, [t]);

  const handleSubmit = useCallback(async (e: FormEvent) => {
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

    let imageUrl = formData.imageUrl;
    let storagePath = formData.storagePath;

    if (pendingFile) {
      const result = await upload('events', pendingFile, UPLOAD_LIMITS.eventImage);
      if (!result) return;
      imageUrl = result.url;
      storagePath = result.storagePath;
    }

    const filteredQuestions = rsvpQuestions.filter(q => q.trim());
    onSubmit({
      title: formData.title,
      date: Timestamp.fromDate(new Date(formData.date)),
      ...(formData.time && { time: formData.time }),
      location: formData.location,
      description: formData.description,
      imageUrl: imageUrl || '/images/placeholder.svg',
      ...(storagePath && { storagePath }),
      rsvpQuestions: filteredQuestions,
      createdBy: user?.uid || '',
    });
  }, [formData, pendingFile, onSubmit, user, upload, t]);

  const isBusy = submitting || uploading;

  return (
    <fieldset disabled={isBusy} className="disabled:opacity-60">
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input
        id="event-title"
        type="text"
        label={t('events.eventTitle')}
        value={formData.title}
        onChange={(v) => handleChange('title', v)}
        error={errors.title}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          id="event-date"
          type="date"
          label={t('events.date')}
          value={formData.date}
          onChange={(v) => handleChange('date', v)}
          error={errors.date}
        />
        <Input
          id="event-time"
          type="time"
          label={t('events.time')}
          value={formData.time}
          onChange={(v) => handleChange('time', v)}
        />
      </div>
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
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-text-primary">{t('events.rsvpQuestions')}</label>
          <button
            type="button"
            onClick={() => setRsvpQuestions(prev => [...prev, ''])}
            className="text-xs font-medium text-byuh-crimson hover:text-byuh-crimson-dark"
          >
            + {t('events.addQuestion')}
          </button>
        </div>
        {rsvpQuestions.length === 0 && (
          <p className="text-xs text-text-secondary">{t('events.noQuestions')}</p>
        )}
        <div className="space-y-2">
          {rsvpQuestions.map((q, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={q}
                onChange={(v) => setRsvpQuestions(prev => prev.map((old, j) => j === i ? v : old))}
                placeholder={t('events.questionPlaceholder')}
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => setRsvpQuestions(prev => prev.filter((_, j) => j !== i))}
                className="shrink-0 rounded-lg px-2 text-sm text-red-500 hover:bg-red-50"
              >
                {t('common.delete')}
              </button>
            </div>
          ))}
        </div>
      </div>

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
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-text-secondary transition-colors hover:border-byuh-crimson hover:text-byuh-crimson"
        >
          {t('events.chooseFile')}
        </button>
        {pendingFile && (
          <span className="ml-2 text-xs text-text-secondary">{pendingFile.name}</span>
        )}
        {errors.image && <p className="mt-1 text-xs text-red-500">{errors.image}</p>}
        {uploadError && <p className="mt-1 text-xs text-red-500">{uploadError}</p>}
        {previewUrl && (
          <img src={previewUrl} alt={t('events.preview')} className="mt-2 h-32 w-full rounded-lg object-cover" />
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" size="sm" disabled={isBusy}>
          {uploading ? t('events.uploading') : submitting ? t('events.saving') : event ? t('common.edit') : t('common.create')}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isBusy}>{t('common.cancel')}</Button>
      </div>
    </form>
    </fieldset>
  );
}
