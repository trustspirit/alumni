import { useState, useCallback } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/common';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useAuth } from '@/hooks/useAuth';
import { UPLOAD_LIMITS } from '@/constants';
import { Timestamp } from 'firebase/firestore';
import type { NewsItem } from '@/types';
import { cn } from '@/lib/cn';

interface NewsFormProps {
  news?: NewsItem;
  onSubmit: (data: Omit<NewsItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  submitting?: boolean;
}

function sanitizeInput(value: string): string {
  return value.replace(/[<>]/g, '').trim();
}

export function NewsForm({ news, onSubmit, onCancel, submitting = false }: NewsFormProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { upload, uploading } = useImageUpload();

  const [formData, setFormData] = useState({
    title: news?.title || '',
    date: news?.date ? news.date.toDate().toISOString().split('T')[0] : '',
    summary: news?.summary || '',
    content: news?.content || '',
    imageUrl: news?.imageUrl || '',
    storagePath: news?.storagePath || '',
    link: news?.link || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: sanitizeInput(value) }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  }, []);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await upload('news', file, UPLOAD_LIMITS.newsImage);
    if (result) setFormData(prev => ({ ...prev, imageUrl: result.url, storagePath: result.storagePath }));
  }, [upload]);

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = t('news.validation.titleRequired');
    if (!formData.date) newErrors.date = t('news.validation.dateRequired');
    if (!formData.summary) newErrors.summary = t('news.validation.summaryRequired');
    if (!formData.content) newErrors.content = t('news.validation.contentRequired');
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit({
      title: formData.title,
      date: Timestamp.fromDate(new Date(formData.date)),
      summary: formData.summary,
      content: formData.content,
      imageUrl: formData.imageUrl || '/images/placeholder.svg',
      ...(formData.storagePath && { storagePath: formData.storagePath }),
      createdBy: user?.uid || '',
      ...(formData.link && { link: formData.link }),
    });
  }, [formData, onSubmit, user, t]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {[
        { field: 'title', label: t('news.newsTitle'), type: 'text' },
        { field: 'date', label: t('news.date'), type: 'date' },
        { field: 'link', label: t('news.externalLink'), type: 'url' },
      ].map(({ field, label, type }) => (
        <div key={field}>
          <label htmlFor={`news-${field}`} className="mb-1 block text-sm font-medium">{label}</label>
          <input
            id={`news-${field}`}
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
        <label htmlFor="news-summary" className="mb-1 block text-sm font-medium">{t('news.summary')}</label>
        <textarea
          id="news-summary"
          value={formData.summary}
          onChange={(e) => handleChange('summary', e.target.value)}
          rows={2}
          className={cn(
            'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-byuh-crimson',
            errors.summary ? 'border-red-500' : 'border-gray-300',
          )}
        />
        {errors.summary && <p className="mt-1 text-xs text-red-500">{errors.summary}</p>}
      </div>

      <div>
        <label htmlFor="news-content" className="mb-1 block text-sm font-medium">{t('news.content')}</label>
        <textarea
          id="news-content"
          value={formData.content}
          onChange={(e) => handleChange('content', e.target.value)}
          rows={5}
          className={cn(
            'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-byuh-crimson',
            errors.content ? 'border-red-500' : 'border-gray-300',
          )}
        />
        {errors.content && <p className="mt-1 text-xs text-red-500">{errors.content}</p>}
      </div>

      <div>
        <label htmlFor="news-image" className="mb-1 block text-sm font-medium">{t('news.image')}</label>
        <input
          id="news-image"
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
          {submitting ? t('news.saving') : news ? t('common.edit') : t('common.create')}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>{t('common.cancel')}</Button>
      </div>
    </form>
  );
}
