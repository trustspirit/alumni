// src/pages/ProfilePage.tsx
import { useState, useCallback, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Button, Input } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';
import { updateUserProfile } from '@/lib/firestore';

function isValidEmail(email: string): boolean {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

function isValidPhone(phone: string): boolean {
  return /^[\d\-+() ]{8,20}$/.test(phone);
}

function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.startsWith('82')) {
    const local = digits.slice(2);
    if (local.length <= 2) return `+82-${local}`;
    if (local.length <= 6) return `+82-${local.slice(0, 2)}-${local.slice(2)}`;
    return `+82-${local.slice(0, 2)}-${local.slice(2, 6)}-${local.slice(6, 10)}`;
  }
  if (digits.length <= 3) return digits;
  if (digits.startsWith('02')) {
    if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    if (digits.length <= 9) return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
  }
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, profile, refreshProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    linkedIn: '',
    graduationYear: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        company: profile.company || '',
        position: profile.position || '',
        linkedIn: profile.linkedIn || '',
        graduationYear: profile.graduationYear || '',
      });
    }
  }, [profile]);

  const validate = useCallback((): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = t('profile.nameRequired');
    if (!formData.email.trim()) {
      newErrors.email = t('profile.emailRequired');
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = t('profile.emailInvalid');
    }
    if (!formData.phone.trim()) {
      newErrors.phone = t('profile.phoneRequired');
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = t('profile.phoneInvalid');
    }
    return newErrors;
  }, [formData, t]);

  const handleChange = useCallback((field: string, value: string) => {
    const formatted = field === 'phone' ? formatPhoneNumber(value) : value;
    setFormData(prev => ({ ...prev, [field]: formatted }));
    setErrors(prev => ({ ...prev, [field]: '' }));
    setSuccess(false);
  }, []);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    if (!user) return;

    setSubmitting(true);
    try {
      await updateUserProfile(user.uid, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company || undefined,
        position: formData.position || undefined,
        linkedIn: formData.linkedIn || undefined,
        graduationYear: formData.graduationYear || undefined,
      });
      await refreshProfile();
      setSuccess(true);
    } catch {
      setErrors({ form: t('profile.errorUpdate') });
    } finally {
      setSubmitting(false);
    }
  }, [formData, user, validate, refreshProfile, t]);

  const requiredFields = [
    { field: 'name', label: t('profile.name'), type: 'text', placeholder: '홍길동' },
    { field: 'email', label: t('profile.email'), type: 'email', placeholder: 'alumni@example.com' },
    { field: 'phone', label: t('profile.phone'), type: 'tel', placeholder: '010-1234-5678' },
  ];

  const optionalFields = [
    { field: 'graduationYear', label: t('profile.graduationYear'), type: 'text', placeholder: '2020' },
    { field: 'company', label: t('profile.company'), type: 'text', placeholder: '' },
    { field: 'position', label: t('profile.position'), type: 'text', placeholder: '' },
    { field: 'linkedIn', label: t('profile.linkedIn'), type: 'url', placeholder: 'https://linkedin.com/in/...' },
  ];

  return (
    <div className="py-20">
      <Container className="max-w-lg">
        <h1 className="text-center font-heading text-2xl font-bold">{t('profile.myProfile')}</h1>
        <p className="mt-2 text-center text-text-secondary">{t('profile.editSubtitle')}</p>

        {errors.form && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">{errors.form}</div>
        )}
        {success && (
          <div className="mt-4 rounded-lg bg-green-50 p-3 text-center text-sm text-green-600">{t('profile.updated')}</div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
          <div className="space-y-4">
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-text-secondary">{t('profile.required')}</h2>
            {requiredFields.map(({ field, label, type, placeholder }) => (
              <Input
                key={field}
                id={field}
                type={type}
                label={label}
                required
                value={formData[field as keyof typeof formData]}
                onChange={(v) => handleChange(field, v)}
                placeholder={placeholder}
                error={errors[field]}
                maxLength={100}
                className="px-4 py-3"
              />
            ))}
          </div>

          <div className="space-y-4">
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-text-secondary">{t('profile.optional')}</h2>
            {optionalFields.map(({ field, label, type, placeholder }) => (
              <Input
                key={field}
                id={field}
                type={type}
                label={label}
                value={formData[field as keyof typeof formData]}
                onChange={(v) => handleChange(field, v)}
                placeholder={placeholder}
                maxLength={200}
                className="px-4 py-3"
              />
            ))}
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? t('profile.saving') : t('profile.update')}
          </Button>
        </form>
      </Container>
    </div>
  );
}
