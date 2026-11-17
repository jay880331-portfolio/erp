'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: UserFormData) => Promise<void>;
  user?: User;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  lastLogin: string;
  createdAt: string;
}

interface UserFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
}

export function UserModal({ isOpen, onClose, onSubmit, user }: UserModalProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Debug log
  console.log('UserModal rendered:', { isOpen, user, loading });
  
  const [formData, setFormData] = useState<UserFormData>({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
    role: user?.role || 'user',
    status: user?.status || 'active',
  });

  const roleOptions = [
    { value: 'user', label: t('users.roles.user') },
    { value: 'admin', label: t('users.roles.admin') },
  ];

  const statusOptions = [
    { value: 'active', label: t('common.active') },
    { value: 'inactive', label: t('common.inactive') },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('users.validation.nameRequired');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('users.validation.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('users.validation.emailInvalid');
    }

    if (!user) { // Creating new user
      if (!formData.password) {
        newErrors.password = t('users.validation.passwordRequired');
      } else if (formData.password.length < 6) {
        newErrors.password = t('users.validation.passwordMinLength');
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = t('users.validation.passwordsDoNotMatch');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      await onSubmit(formData);
      onClose();
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user',
        status: 'active',
      });
      setErrors({});
    } catch (error) {
      console.error('Error submitting user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? t('users.editUser') : t('users.createUser')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('users.userName')}
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          required
        />

        <Input
          label={t('users.email')}
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
          required
        />

        {!user && (
          <>
            <Input
              label={t('auth.password')}
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              error={errors.password}
              required
            />

            <Input
              label={t('auth.confirmPassword')}
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              error={errors.confirmPassword}
              required
            />
          </>
        )}

        <Select
          label={t('users.role')}
          value={formData.role}
          onChange={(e) => handleChange('role', e.target.value)}
          options={roleOptions}
          required
        />

        <Select
          label={t('common.status')}
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value)}
          options={statusOptions}
          required
        />

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            {user ? t('common.update') : t('common.create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}