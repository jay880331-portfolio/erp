'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { UserModal } from '@/components/users/UserModal';
import { useTranslations } from 'next-intl';
import { api } from '@/utils/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  lastLogin: string;
  createdAt: string;
}

export default function UsersPage() {
  const t = useTranslations();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/users');
      // API가 pagination 객체를 반환하는지 확인
      const usersArray = Array.isArray(data) ? data : (data.data || data.users || []);
      setUsers(usersArray);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]); // 에러 시 빈 배열로 설정
    } finally {
      setLoading(false);
    }
  };

  interface UserFormData {
    name: string;
    email: string;
    role: 'admin' | 'user';
    status: 'active' | 'inactive';
    password?: string;
  }

  const handleCreateUser = async (userData: UserFormData) => {
    try {
      await api.post('/api/users', userData);
      await fetchUsers();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  };

  const handleEditUser = async (userData: UserFormData) => {
    if (!editingUser) return;

    try {
      await api.put(`/api/users/${editingUser.id}`, userData);
      await fetchUsers();
      setEditingUser(undefined);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(t('users.deleteConfirm') + ` "${user.name}"?`)) {
      return;
    }

    try {
      await api.delete(`/api/users/${user.id}`);
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(t('users.deleteFailed'));
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return t('users.never');
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' 
      ? 'text-purple-700 bg-purple-50' 
      : 'text-blue-700 bg-blue-50';
  };

  const columns = [
    {
      key: 'name',
      label: t('users.userName'),
      className: 'text-gray-900 font-medium',
    },
    {
      key: 'email',
      label: t('users.email'),
      className: 'text-gray-900',
    },
    {
      key: 'role',
      label: t('users.role'),
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(value)}`}>
          {t(`users.roles.${value}`)}
        </span>
      ),
    },
    {
      key: 'status',
      label: t('common.status'),
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'active' ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
        }`}>
          {t(`common.${value}`)}
        </span>
      ),
    },
    {
      key: 'lastLogin',
      label: t('users.lastLogin'),
      render: (value: string) => formatDate(value),
      className: 'text-gray-900',
    },
    {
      key: 'createdAt',
      label: t('users.createdAt'),
      render: (value: string) => formatDate(value),
      className: 'text-gray-900',
    },
    {
      key: 'actions',
      label: t('common.actions'),
      render: (_value: unknown, row: User) => (
        <div className="flex space-x-2">
          <button 
            onClick={() => setEditingUser(row)}
            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
          >
            {t('common.edit')}
          </button>
          <button 
            onClick={() => handleDeleteUser(row)}
            className="text-red-600 hover:text-red-900 text-sm font-medium"
          >
            {t('common.delete')}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('users.title')}</h1>
          <p className="text-gray-600">{t('users.description')}</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          {t('users.createUser')}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-blue-600 text-xl">👥</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('users.totalUsers')}</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {users.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-green-600 text-xl">✅</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('users.activeUsers')}</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {users.filter(user => user.status === 'active').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-purple-600 text-xl">👑</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('users.adminUsers')}</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {users.filter(user => user.role === 'admin').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-yellow-600 text-xl">📊</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('users.regularUsers')}</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {users.filter(user => user.role === 'user').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        emptyMessage={t('users.noUsersFound')}
        onRowClick={(user) => console.log('User clicked:', user)}
      />

      {/* User Modal */}
      <UserModal
        isOpen={showCreateModal || !!editingUser}
        onClose={() => {
          setShowCreateModal(false);
          setEditingUser(undefined);
        }}
        onSubmit={editingUser ? handleEditUser : handleCreateUser}
        user={editingUser}
      />
    </div>
  );
}