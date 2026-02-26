import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';
import { ALLOWED_IMAGE_TYPES } from '@/constants';

export interface UploadResult {
  url: string;
  storagePath: string;
}

function validateImage(file: File, maxSize: number): void {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
    throw new Error('허용되지 않는 파일 형식입니다. (JPEG, PNG, WebP만 가능)');
  }
  if (file.size > maxSize) {
    throw new Error(`파일 크기가 ${Math.round(maxSize / 1024 / 1024)}MB를 초과합니다.`);
  }
}

export async function uploadImage(
  path: string,
  file: File,
  maxSize: number,
): Promise<UploadResult> {
  validateImage(file, maxSize);
  const ext = file.name.split('.').pop() || 'jpg';
  const storagePath = `${path}/${crypto.randomUUID()}.${ext}`;
  const storageRef = ref(storage, storagePath);
  const snapshot = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snapshot.ref);
  return { url, storagePath };
}

export async function deleteImage(pathOrUrl: string): Promise<void> {
  const storageRef = ref(storage, pathOrUrl);
  await deleteObject(storageRef);
}
