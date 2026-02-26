import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, SectionHeading, Button, Modal } from '@/components/common';
import { NewsForm } from '@/components/admin';
import { useNews, useCreateNews, useUpdateNews, useDeleteNews } from '@/hooks/useData';
import type { NewsItem } from '@/types';
import type { Timestamp } from 'firebase/firestore';

function formatDate(ts: Timestamp): string {
  return ts.toDate().toLocaleDateString('ko-KR');
}

export default function AdminNews() {
  const { t } = useTranslation();
  const { data: news = [] } = useNews();
  const createMutation = useCreateNews();
  const updateMutation = useUpdateNews();
  const deleteMutation = useDeleteNews();
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreate = useCallback((data: Omit<NewsItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    createMutation.mutate(data, { onSuccess: () => setIsCreateModalOpen(false) });
  }, [createMutation]);

  const handleUpdate = useCallback((data: Omit<NewsItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingNews) return;
    updateMutation.mutate({ id: editingNews.id, data }, { onSuccess: () => setEditingNews(null) });
  }, [editingNews, updateMutation]);

  const handleDelete = useCallback((id: string) => {
    if (window.confirm(t('admin.confirmDeleteNews'))) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation, t]);

  return (
    <div className="py-20">
      <Container>
        <div className="mb-8 flex items-center justify-between">
          <SectionHeading title={t('news.manageTitle')} className="mb-0" />
          <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>{t('news.newNews')}</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-xs uppercase text-text-secondary">
              <tr>
                <th className="px-4 py-3">{t('news.newsTitle')}</th>
                <th className="px-4 py-3">{t('news.date')}</th>
                <th className="px-4 py-3">{t('news.manage')}</th>
              </tr>
            </thead>
            <tbody>
              {news.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-surface">
                  <td className="px-4 py-3 font-medium">{item.title}</td>
                  <td className="px-4 py-3 text-text-secondary">{formatDate(item.date)}</td>
                  <td className="flex gap-2 px-4 py-3">
                    <button type="button" onClick={() => setEditingNews(item)} className="text-xs text-byuh-crimson hover:underline">{t('common.edit')}</button>
                    <button type="button" onClick={() => handleDelete(item.id)} className="text-xs text-red-500 hover:underline" disabled={deleteMutation.isPending}>{t('common.delete')}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title={t('admin.createNews')}>
          <NewsForm onSubmit={handleCreate} onCancel={() => setIsCreateModalOpen(false)} submitting={createMutation.isPending} />
        </Modal>

        <Modal isOpen={!!editingNews} onClose={() => setEditingNews(null)} title={t('admin.editNews')}>
          {editingNews && (
            <NewsForm news={editingNews} onSubmit={handleUpdate} onCancel={() => setEditingNews(null)} submitting={updateMutation.isPending} />
          )}
        </Modal>
      </Container>
    </div>
  );
}
