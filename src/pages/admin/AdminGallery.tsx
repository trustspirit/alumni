import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, SectionHeading } from '@/components/common';
import { GalleryUploader } from '@/components/admin';
import { useGallery, useCreateGalleryImage, useDeleteGalleryImage } from '@/hooks/useData';
import { deleteImage } from '@/lib/storage';

export default function AdminGallery() {
  const { t } = useTranslation();
  const { data: images = [] } = useGallery();
  const createMutation = useCreateGalleryImage();
  const deleteMutation = useDeleteGalleryImage();

  const handleUpload = useCallback((data: { src: string; storagePath: string; alt: string; category: string; uploadedBy: string }) => {
    createMutation.mutate(data);
  }, [createMutation]);

  const handleDelete = useCallback(async (id: string, src: string, storagePath?: string) => {
    if (!window.confirm(t('admin.confirmDeleteImage'))) return;
    try {
      await deleteImage(storagePath || src);
    } catch {
      // Storage deletion may fail if URL format differs; proceed with Firestore deletion
    }
    deleteMutation.mutate(id);
  }, [deleteMutation, t]);

  return (
    <div className="py-20">
      <Container>
        <SectionHeading title={t('gallery.manageTitle')} subtitle={t('gallery.total', { count: images.length })} />

        <div className="mb-8">
          <GalleryUploader onUpload={handleUpload} submitting={createMutation.isPending} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img) => (
            <div key={img.id} className="group relative overflow-hidden rounded-xl">
              <img src={img.src} alt={img.alt} className="aspect-video w-full object-cover" />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex w-full items-center justify-between p-3">
                  <div>
                    <p className="text-sm font-medium text-white">{img.alt}</p>
                    <p className="text-xs text-white/70">{img.category}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(img.id, img.src, img.storagePath)}
                    className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                    disabled={deleteMutation.isPending}
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
