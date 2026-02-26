import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '@/components/common';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useAuth } from '@/hooks/useAuth';
import { UPLOAD_LIMITS } from '@/constants';

interface GalleryUploaderProps {
  onUpload: (data: { src: string; storagePath: string; alt: string; category: string; uploadedBy: string }) => void;
  submitting?: boolean;
}

export function GalleryUploader({ onUpload, submitting = false }: GalleryUploaderProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { upload, uploading, error: uploadError } = useImageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [alt, setAlt] = useState('');
  const [category, setCategory] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<{ url: string; storagePath: string } | null>(null);
  const previewUrlRef = useRef<string | null>(null);

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
      alt: alt.trim(),
      category: category.trim(),
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
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
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
        </div>
        {previewUrl && (
          <img src={previewUrl} alt={t('events.preview')} className="h-32 w-full rounded-lg object-cover" />
        )}
        <Input
          placeholder={t('gallery.photoAlt')}
          value={alt}
          onChange={setAlt}
          maxLength={200}
        />
        <Input
          placeholder={t('gallery.category')}
          value={category}
          onChange={setCategory}
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
