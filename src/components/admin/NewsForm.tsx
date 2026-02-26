import { useState, useCallback, useRef, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Textarea } from '@/components/common';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useAuth } from '@/hooks/useAuth';
import { UPLOAD_LIMITS } from '@/constants';
import { Timestamp } from 'firebase/firestore';
import type { NewsItem } from '@/types';

interface NewsFormProps {
  news?: NewsItem;
  onSubmit: (data: Omit<NewsItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  submitting?: boolean;
}

export function NewsForm({ news, onSubmit, onCancel, submitting = false }: NewsFormProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { upload, uploading, error: uploadError } = useImageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  const [formData, setFormData] = useState({
    title: news?.title || '',
    date: news?.date ? news.date.toDate().toISOString().split('T')[0] : '',
    summary: news?.summary || '',
    content: news?.content || '',
    imageUrl: news?.imageUrl || '',
    storagePath: news?.storagePath || '',
    link: news?.link || '',
  });
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(news?.imageUrl || null);
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

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setPreviewUrl(url);
    setPendingFile(file);
  }, []);

  const handleSubmit = useCallback(async (e: FormEvent) => {
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

    let imageUrl = formData.imageUrl;
    let storagePath = formData.storagePath;

    if (pendingFile) {
      const result = await upload('news', pendingFile, UPLOAD_LIMITS.newsImage);
      if (!result) return;
      imageUrl = result.url;
      storagePath = result.storagePath;
    }

    onSubmit({
      title: formData.title,
      date: Timestamp.fromDate(new Date(formData.date)),
      summary: formData.summary,
      content: formData.content,
      imageUrl: imageUrl || '/images/placeholder.svg',
      ...(storagePath && { storagePath }),
      createdBy: user?.uid || '',
      ...(formData.link && { link: formData.link }),
    });
  }, [formData, pendingFile, onSubmit, user, upload, t]);

  const isBusy = submitting || uploading;

  return (
    <fieldset disabled={isBusy} className="disabled:opacity-60">
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {[
        { field: 'title', label: t('news.newsTitle'), type: 'text' },
        { field: 'date', label: t('news.date'), type: 'date' },
        { field: 'link', label: t('news.externalLink'), type: 'url' },
      ].map(({ field, label, type }) => (
        <Input
          key={field}
          id={`news-${field}`}
          type={type}
          label={label}
          value={formData[field as keyof typeof formData]}
          onChange={(v) => handleChange(field, v)}
          error={errors[field]}
        />
      ))}

      <Textarea
        id="news-summary"
        label={t('news.summary')}
        value={formData.summary}
        onChange={(v) => handleChange('summary', v)}
        rows={2}
        error={errors.summary}
      />

      <Textarea
        id="news-content"
        label={t('news.content')}
        value={formData.content}
        onChange={(v) => handleChange('content', v)}
        rows={5}
        error={errors.content}
      />

      <div>
        <label htmlFor="news-image" className="mb-1 block text-sm font-medium text-text-primary">{t('news.image')}</label>
        <input
          ref={fileInputRef}
          id="news-image"
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
        {uploadError && <p className="mt-1 text-xs text-red-500">{uploadError}</p>}
        {previewUrl && (
          <img src={previewUrl} alt={t('events.preview')} className="mt-2 h-32 w-full rounded-lg object-cover" />
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" size="sm" disabled={isBusy}>
          {uploading ? t('events.uploading') : submitting ? t('news.saving') : news ? t('common.edit') : t('common.create')}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isBusy}>{t('common.cancel')}</Button>
      </div>
    </form>
    </fieldset>
  );
}
