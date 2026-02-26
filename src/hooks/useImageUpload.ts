import { useState, useCallback } from 'react';
import { uploadImage } from '@/lib/storage';
import type { UploadResult } from '@/lib/storage';

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (path: string, file: File, maxSize: number): Promise<UploadResult | null> => {
    setUploading(true);
    setError(null);
    try {
      const result = await uploadImage(path, file, maxSize);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : '업로드 중 오류가 발생했습니다';
      setError(msg);
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  return { upload, uploading, error };
}
