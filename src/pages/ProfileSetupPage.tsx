// src/pages/ProfileSetupPage.tsx
import { useState, useCallback } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, Button } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';
import { createUserProfile } from '@/lib/firestore';
import { cn } from '@/lib/cn';

function sanitizeInput(value: string): string {
  return value.replace(/[<>]/g, '').trim();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  return /^[\d\-+() ]{8,20}$/.test(phone);
}

export default function ProfileSetupPage() {
  const { t } = useTranslation();
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    company: '',
    position: '',
    linkedIn: '',
    graduationYear: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

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
    if (!formData.graduationYear.trim()) {
      newErrors.graduationYear = t('profile.graduationYearRequired');
    }
    return newErrors;
  }, [formData, t]);

  const handleChange = useCallback((field: string, value: string) => {
    const sanitized = sanitizeInput(value);
    setFormData(prev => ({ ...prev, [field]: sanitized }));
    setErrors(prev => ({ ...prev, [field]: '' }));
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
      await createUserProfile(user.uid, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        ...(formData.company && { company: formData.company }),
        ...(formData.position && { position: formData.position }),
        ...(formData.linkedIn && { linkedIn: formData.linkedIn }),
        graduationYear: formData.graduationYear,
      });
      await refreshProfile();
      navigate('/', { replace: true });
    } catch {
      setErrors({ form: t('profile.errorCreate') });
    } finally {
      setSubmitting(false);
    }
  }, [formData, user, validate, refreshProfile, navigate, t]);

  const requiredFields = [
    { field: 'name', label: t('profile.name'), type: 'text', placeholder: '홍길동' },
    { field: 'email', label: t('profile.email'), type: 'email', placeholder: 'alumni@example.com' },
    { field: 'phone', label: t('profile.phone'), type: 'tel', placeholder: '010-1234-5678' },
    { field: 'graduationYear', label: t('profile.graduationYear'), type: 'text', placeholder: '2020' },
  ];

  const optionalFields = [
    { field: 'company', label: t('profile.company'), type: 'text', placeholder: '' },
    { field: 'position', label: t('profile.position'), type: 'text', placeholder: '' },
    { field: 'linkedIn', label: t('profile.linkedIn'), type: 'url', placeholder: 'https://linkedin.com/in/...' },
  ];

  return (
    <div className="py-20">
      <Container className="max-w-lg">
        <h1 className="text-center font-heading text-2xl font-bold">{t('profile.setup')}</h1>
        <p className="mt-2 text-center text-text-secondary">
          {t('profile.setupSubtitle')}
        </p>

        {errors.form && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
          <div className="space-y-4">
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-text-secondary">
              {t('profile.required')}
            </h2>
            {requiredFields.map(({ field, label, type, placeholder }) => (
              <div key={field}>
                <label htmlFor={field} className="mb-2 block text-sm font-medium text-text-primary">
                  {label} <span className="text-byuh-crimson">*</span>
                </label>
                <input
                  id={field}
                  type={type}
                  value={formData[field as keyof typeof formData]}
                  onChange={(e) => handleChange(field, e.target.value)}
                  placeholder={placeholder}
                  className={cn(
                    'w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-byuh-crimson',
                    errors[field] ? 'border-red-500' : 'border-gray-300',
                  )}
                  maxLength={100}
                />
                {errors[field] && (
                  <p className="mt-1 text-sm text-red-500">{errors[field]}</p>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-text-secondary">
              {t('profile.optional')}
            </h2>
            {optionalFields.map(({ field, label, type, placeholder }) => (
              <div key={field}>
                <label htmlFor={field} className="mb-2 block text-sm font-medium text-text-primary">
                  {label}
                </label>
                <input
                  id={field}
                  type={type}
                  value={formData[field as keyof typeof formData]}
                  onChange={(e) => handleChange(field, e.target.value)}
                  placeholder={placeholder}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-byuh-crimson"
                  maxLength={200}
                />
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? t('profile.saving') : t('profile.complete')}
          </Button>
        </form>
      </Container>
    </div>
  );
}
