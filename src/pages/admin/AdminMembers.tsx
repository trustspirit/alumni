import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, SectionHeading } from '@/components/common';
import { MemberTable } from '@/components/admin';
import { useAllUsers, useUpdateUserRole } from '@/hooks/useData';
import type { UserRole } from '@/types';

export default function AdminMembers() {
  const { t } = useTranslation();
  const { data: users = [] } = useAllUsers();
  const updateRoleMutation = useUpdateUserRole();
  const [updatingUid, setUpdatingUid] = useState<string | undefined>();

  const handleRoleChange = useCallback((uid: string, role: UserRole) => {
    setUpdatingUid(uid);
    updateRoleMutation.mutate({ uid, role }, {
      onSettled: () => setUpdatingUid(undefined),
    });
  }, [updateRoleMutation]);

  return (
    <div className="py-20">
      <Container>
        <SectionHeading title={t('admin.members.title')} subtitle={t('admin.members.total', { count: users.length })} />
        <div className="rounded-xl bg-white shadow-sm">
          <MemberTable members={users} onRoleChange={handleRoleChange} updatingUid={updatingUid} />
        </div>
      </Container>
    </div>
  );
}
