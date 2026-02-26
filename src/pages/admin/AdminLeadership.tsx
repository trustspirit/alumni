import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, SectionHeading, Button, Modal, Input, Textarea } from '@/components/common';
import {
  useLeadership, useAllUsers,
  useAddLeadership, useUpdateLeadership, useDeleteLeadership, useReorderLeadership,
} from '@/hooks/useData';
import type { LeadershipEntry, UserProfile } from '@/types';

export default function AdminLeadership() {
  const { t } = useTranslation();
  const { data: entries = [] } = useLeadership();
  const { data: allUsers = [] } = useAllUsers();
  const addMutation = useAddLeadership();
  const updateMutation = useUpdateLeadership();
  const deleteMutation = useDeleteLeadership();
  const reorderMutation = useReorderLeadership();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LeadershipEntry | null>(null);
  const [selectedUid, setSelectedUid] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // Users map for quick lookup
  const usersMap = new Map<string, UserProfile>();
  allUsers.forEach(u => usersMap.set(u.uid, u));

  // Users not already in leadership
  const availableUsers = allUsers.filter(u => !entries.some(e => e.uid === u.uid));

  const resetForm = useCallback(() => {
    setSelectedUid('');
    setTitle('');
    setDescription('');
  }, []);

  const handleAdd = useCallback(() => {
    if (!selectedUid || !title.trim()) return;
    addMutation.mutate(
      { uid: selectedUid, title: title.trim(), description: description.trim(), order: entries.length },
      { onSuccess: () => { setIsAddOpen(false); resetForm(); } },
    );
  }, [selectedUid, title, description, entries.length, addMutation, resetForm]);

  const openEdit = useCallback((entry: LeadershipEntry) => {
    setEditingEntry(entry);
    setTitle(entry.title);
    setDescription(entry.description);
  }, []);

  const handleUpdate = useCallback(() => {
    if (!editingEntry || !title.trim()) return;
    updateMutation.mutate(
      { id: editingEntry.id, data: { title: title.trim(), description: description.trim() } },
      { onSuccess: () => { setEditingEntry(null); resetForm(); } },
    );
  }, [editingEntry, title, description, updateMutation, resetForm]);

  const handleDelete = useCallback((id: string) => {
    if (window.confirm(t('admin.leadership.confirmDelete'))) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation, t]);

  // Drag & drop
  const handleDragStart = useCallback((index: number) => {
    dragItem.current = index;
  }, []);

  const handleDragEnter = useCallback((index: number) => {
    dragOverItem.current = index;
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) {
      dragItem.current = null;
      dragOverItem.current = null;
      return;
    }
    const reordered = [...entries];
    const [removed] = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOverItem.current, 0, removed);
    dragItem.current = null;
    dragOverItem.current = null;

    reorderMutation.mutate(reordered.map((e, i) => ({ id: e.id, order: i })));
  }, [entries, reorderMutation]);

  return (
    <div className="py-20">
      <Container>
        <div className="mb-8 flex items-center justify-between">
          <SectionHeading title={t('admin.leadership.title')} className="mb-0" />
          <Button size="sm" onClick={() => { resetForm(); setIsAddOpen(true); }}>
            {t('admin.leadership.add')}
          </Button>
        </div>

        {entries.length === 0 ? (
          <p className="text-center text-text-secondary">{t('admin.leadership.empty')}</p>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, index) => {
              const user = usersMap.get(entry.uid);
              return (
                <div
                  key={entry.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  className="flex cursor-grab items-center gap-4 rounded-xl bg-white p-4 shadow-sm active:cursor-grabbing"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center text-text-secondary">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
                    </svg>
                  </div>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-byuh-crimson text-sm font-bold text-white">
                    {user?.profileImageUrl ? (
                      <img src={user.profileImageUrl} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      user?.name.charAt(0) || '?'
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-sm font-semibold">{user?.name || entry.uid}</p>
                    <p className="text-xs text-byuh-crimson">{entry.title}</p>
                    {entry.description && (
                      <p className="mt-0.5 truncate text-xs text-text-secondary">{entry.description}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => openEdit(entry)} className="text-xs text-byuh-crimson hover:underline">
                      {t('common.edit')}
                    </button>
                    <button type="button" onClick={() => handleDelete(entry.id)} className="text-xs text-red-500 hover:underline">
                      {t('common.delete')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Modal */}
        <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title={t('admin.leadership.add')}>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-text-primary">{t('admin.leadership.selectMember')}</label>
              <select
                value={selectedUid}
                onChange={(e) => setSelectedUid(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-byuh-crimson"
              >
                <option value="">{t('admin.leadership.chooseMember')}</option>
                {availableUsers.map(u => (
                  <option key={u.uid} value={u.uid}>{u.name} {u.graduationYear ? `(${u.graduationYear})` : ''}</option>
                ))}
              </select>
            </div>
            <Input label={t('admin.leadership.leaderTitle')} value={title} onChange={setTitle} placeholder={t('admin.leadership.titlePlaceholder')} />
            <Textarea label={t('admin.leadership.description')} value={description} onChange={setDescription} rows={3} placeholder={t('admin.leadership.descPlaceholder')} />
            <div className="flex gap-3 pt-2">
              <Button size="sm" onClick={handleAdd} disabled={!selectedUid || !title.trim() || addMutation.isPending}>
                {addMutation.isPending ? t('events.saving') : t('common.create')}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>{t('common.cancel')}</Button>
            </div>
          </div>
        </Modal>

        {/* Edit Modal */}
        <Modal isOpen={!!editingEntry} onClose={() => setEditingEntry(null)} title={t('admin.leadership.edit')}>
          <div className="space-y-4">
            <Input label={t('admin.leadership.leaderTitle')} value={title} onChange={setTitle} placeholder={t('admin.leadership.titlePlaceholder')} />
            <Textarea label={t('admin.leadership.description')} value={description} onChange={setDescription} rows={3} placeholder={t('admin.leadership.descPlaceholder')} />
            <div className="flex gap-3 pt-2">
              <Button size="sm" onClick={handleUpdate} disabled={!title.trim() || updateMutation.isPending}>
                {updateMutation.isPending ? t('events.saving') : t('common.edit')}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditingEntry(null)}>{t('common.cancel')}</Button>
            </div>
          </div>
        </Modal>
      </Container>
    </div>
  );
}
