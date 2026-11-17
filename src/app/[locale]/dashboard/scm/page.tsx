'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export default function SCMPage() {
  const t = useTranslations();
  const locale = useLocale();
  
  const modules = [
    {
      title: t('scm.items.title'),
      description: t('scm.items.description'),
      href: `/${locale}/dashboard/scm/items`,
      icon: '📦',
      stats: '0 items'
    },
    {
      title: t('scm.inventory.title'),
      description: t('scm.inventory.description'),
      href: `/${locale}/dashboard/scm/inventory`,
      icon: '📊',
      stats: '0 in stock'
    },
    {
      title: t('scm.movements.title'),
      description: t('scm.movements.description'),
      href: `/${locale}/dashboard/scm/inventory/movements`,
      icon: '🔄',
      stats: '0 movements'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">📦</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('scm.totalItems')}</dt>
                  <dd className="text-lg font-medium text-gray-900">0</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">📊</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('scm.totalStock')}</dt>
                  <dd className="text-lg font-medium text-gray-900">0</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">⚠️</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('scm.lowStock')}</dt>
                  <dd className="text-lg font-medium text-gray-900">0</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SCM Modules */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <Link
            key={module.title}
            href={module.href}
            className="relative group bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
          >
            <div>
              <span className="text-3xl mb-4 block">{module.icon}</span>
              <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">
                {module.title}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {module.description}
              </p>
              <p className="mt-3 text-sm font-medium text-indigo-600">
                {module.stats}
              </p>
            </div>
            <span
              className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
              aria-hidden="true"
            >
              →
            </span>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            {t('scm.recentActivity')}
          </h3>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📦</div>
            <p className="text-gray-500">{t('scm.noRecentActivity')}</p>
            <p className="text-sm text-gray-400 mt-2">
              {t('scm.recentActivityDescription')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}