import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { UserProfile, UserRole } from '@/types';
import { cn } from '@/lib/cn';

interface MemberTableProps {
  members: UserProfile[];
  onRoleChange: (uid: string, role: UserRole) => void;
  updatingUid?: string;
}

export function MemberTable({ members, onRoleChange, updatingUid }: MemberTableProps) {
  const { t } = useTranslation();

  const handleRoleChange = useCallback((uid: string, role: string) => {
    onRoleChange(uid, role as UserRole);
  }, [onRoleChange]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 text-xs uppercase text-text-secondary">
          <tr>
            <th className="px-4 py-3">{t('admin.members.name')}</th>
            <th className="px-4 py-3">{t('admin.members.email')}</th>
            <th className="px-4 py-3">{t('admin.members.phone')}</th>
            <th className="px-4 py-3">{t('admin.members.graduationYear')}</th>
            <th className="px-4 py-3">{t('admin.members.role')}</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.uid} className="border-b border-gray-100 hover:bg-surface">
              <td className="px-4 py-3 font-medium">{member.name}</td>
              <td className="px-4 py-3 text-text-secondary">{member.email}</td>
              <td className="px-4 py-3 text-text-secondary">{member.phone}</td>
              <td className="px-4 py-3 text-text-secondary">{member.graduationYear || '-'}</td>
              <td className="px-4 py-3">
                <select
                  value={member.role}
                  onChange={(e) => handleRoleChange(member.uid, e.target.value)}
                  disabled={updatingUid === member.uid}
                  className={cn(
                    'rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-byuh-crimson',
                    updatingUid === member.uid && 'opacity-50',
                  )}
                >
                  <option value="member">{t('admin.members.roleMember')}</option>
                  <option value="manager">{t('admin.members.roleManager')}</option>
                  <option value="admin">{t('admin.members.roleAdmin')}</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
