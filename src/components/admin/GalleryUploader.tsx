import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/common';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useAuth } from '@/hooks/useAuth';
import { UPLOAD_LIMITS } from '@/constants';

interface GalleryUploaderProps {
  onUpload: (data: { src: string; storagePath: string; alt: string; category: string; uploadedBy: string }) => void;
  submitting?: boolean;
}

function sanitizeInput(value: string): string {
  return value.replace(/[<>]/g, '').trim();
}

export function GalleryUploader({ onUpload, submitting = false }: GalleryUploaderProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { upload, uploading, error: uploadError } = useImageUpload();
  const [alt, setAlt] = useState('');
  const [category, setCategory] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<{ url: string; storagePath: string } | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  // Revoke object URL on unmount or when previewUrl changes
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Revoke old preview URL before creating new one
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    const newPreviewUrl = URL.createObjectURL(file);
    previewUrlRef.current = newPreviewUrl;
    setPreviewUrl(newPreviewUrl);

    const result = await upload('gallery', file, UPLOAD_LIMITS.galleryImage);
    if (result) setUploadResult(result);
  }, [upload]);

  const handleSubmit = useCallback(() => {
    if (!uploadResult || !alt.trim() || !category.trim() || !user) return;
    onUpload({
      src: uploadResult.url,
      storagePath: uploadResult.storagePath,
      alt: sanitizeInput(alt),
      category: sanitizeInput(category),
      uploadedBy: user.uid,
    });
    setAlt('');
    setCategory('');
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreviewUrl(null);
    setUploadResult(null);
  }, [uploadResult, alt, category, user, onUpload]);

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h3 className="mb-4 font-heading text-lg font-semibold">{t('gallery.uploadTitle')}</h3>
      <div className="space-y-4">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="w-full text-sm"
          disabled={uploading}
        />
        {uploading && <p className="text-xs text-text-secondary">{t('events.uploading')}</p>}
        {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
        {previewUrl && (
          <img src={previewUrl} alt={t('events.preview')} className="h-32 w-full rounded-lg object-cover" />
        )}
        <input
          type="text"
          placeholder={t('gallery.photoAlt')}
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-byuh-crimson"
          maxLength={200}
        />
        <input
          type="text"
          placeholder={t('gallery.category')}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-byuh-crimson"
          maxLength={50}
        />
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!uploadResult || !alt.trim() || !category.trim() || submitting}
        >
          {submitting ? t('gallery.adding') : t('gallery.addToGallery')}
        </Button>
      </div>
    </div>
  );
}
