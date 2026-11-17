'use client';

import { useTranslations } from 'next-intl';

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations();
  
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">{t('finance.title')}</h1>
        <p className="text-gray-600">{t('finance.description')}</p>
      </div>
      {children}
    </div>
  );
}