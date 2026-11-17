'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useTranslations } from 'next-intl';

interface ReportData {
  incomeStatement: {
    revenue: { name: string; amount: number }[];
    expenses: { name: string; amount: number }[];
    netIncome: number;
  };
  balanceSheet: {
    assets: { name: string; amount: number }[];
    liabilities: { name: string; amount: number }[];
    equity: { name: string; amount: number }[];
    totalAssets: number;
    totalLiabilitiesAndEquity: number;
  };
}

export default function ReportsPage() {
  const t = useTranslations();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('income-statement');
  const [dateFrom, setDateFrom] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const reportTypes = [
    { value: 'income-statement', label: t('finance.reports.incomeStatement') },
    { value: 'balance-sheet', label: t('finance.reports.balanceSheet') },
  ];

    const generateReport = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        type: reportType,
        dateFrom,
        dateTo,
      });

      const response = await fetch(`/api/finance/reports?${params}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  }, [reportType, dateFrom, dateTo]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const exportToPDF = () => {
    // TODO: Implement PDF export
    alert(t('finance.reports.exportNotImplemented'));
  };

  const exportToExcel = () => {
    // TODO: Implement Excel export
    alert(t('finance.reports.exportNotImplemented'));
  };

  useEffect(() => {
    generateReport();
  }, [generateReport]);

  const renderIncomeStatement = () => {
    if (!reportData?.incomeStatement) return null;

    const { revenue, expenses, netIncome } = reportData.incomeStatement;
    const totalRevenue = revenue.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);

    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">{t('finance.reports.incomeStatement')}</h2>
            <p className="text-sm text-gray-500">
              For the period {new Date(dateFrom).toLocaleDateString()} to {new Date(dateTo).toLocaleDateString()}
            </p>
          </div>

          {/* Revenue Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
              {t('finance.reports.revenue')}
            </h3>
            {revenue.map((item, index) => (
              <div key={index} className="flex justify-between py-2">
                <span className="text-gray-700">{item.name}</span>
                <span className="font-medium text-gray-900">{formatCurrency(item.amount)}</span>
              </div>
            ))}
            <div className="flex justify-between py-2 border-t border-gray-200 font-semibold">
              <span className="text-gray-900">{t('finance.reports.totalRevenue')}</span>
              <span className="text-gray-900">{formatCurrency(totalRevenue)}</span>
            </div>
          </div>

          {/* Expenses Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
              {t('finance.reports.expenses')}
            </h3>
            {expenses.map((item, index) => (
              <div key={index} className="flex justify-between py-2">
                <span className="text-gray-700">{item.name}</span>
                <span className="font-medium text-gray-900">{formatCurrency(item.amount)}</span>
              </div>
            ))}
            <div className="flex justify-between py-2 border-t border-gray-200 font-semibold">
              <span className="text-gray-900">{t('finance.reports.totalExpenses')}</span>
              <span className="text-gray-900">{formatCurrency(totalExpenses)}</span>
            </div>
          </div>

          {/* Net Income */}
          <div className="border-t-2 border-gray-300 pt-4">
            <div className="flex justify-between text-xl font-bold">
              <span className="text-gray-900">{t('finance.reports.netIncome')}</span>
              <span className={netIncome >= 0 ? 'text-green-600' : 'text-red-600'}>
                {formatCurrency(netIncome)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBalanceSheet = () => {
    if (!reportData?.balanceSheet) return null;

    const { assets, liabilities, equity, totalAssets, totalLiabilitiesAndEquity } = reportData.balanceSheet;
    const totalLiabilities = liabilities.reduce((sum, item) => sum + item.amount, 0);
    const totalEquity = equity.reduce((sum, item) => sum + item.amount, 0);

    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">{t('finance.reports.balanceSheet')}</h2>
            <p className="text-sm text-gray-500">
              As of {new Date(dateTo).toLocaleDateString()}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Assets */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                {t('finance.reports.assets')}
              </h3>
              {assets.map((item, index) => (
                <div key={index} className="flex justify-between py-2">
                  <span className="text-gray-700">{item.name}</span>
                  <span className="font-medium text-gray-900">{formatCurrency(item.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 border-t border-gray-200 font-semibold">
                <span className="text-gray-900">{t('finance.accounts.totalAssets')}</span>
                <span className="text-gray-900">{formatCurrency(totalAssets)}</span>
              </div>
            </div>

            {/* Liabilities & Equity */}
            <div>
              {/* Liabilities */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                  {t('finance.reports.liabilities')}
                </h3>
                {liabilities.map((item, index) => (
                  <div key={index} className="flex justify-between py-2">
                    <span className="text-gray-700">{item.name}</span>
                    <span className="font-medium text-gray-900">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 border-t border-gray-200 font-semibold">
                  <span className="text-gray-900">{t('finance.accounts.totalLiabilities')}</span>
                  <span className="text-gray-900">{formatCurrency(totalLiabilities)}</span>
                </div>
              </div>

              {/* Equity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                  {t('finance.accounts.equity')}
                </h3>
                {equity.map((item, index) => (
                  <div key={index} className="flex justify-between py-2">
                    <span className="text-gray-700">{item.name}</span>
                    <span className="font-medium text-gray-900">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 border-t border-gray-200 font-semibold">
                  <span className="text-gray-900">{t('finance.reports.totalEquity')}</span>
                  <span className="text-gray-900">{formatCurrency(totalEquity)}</span>
                </div>
              </div>

              {/* Total Liabilities & Equity */}
              <div className="border-t-2 border-gray-300 pt-4 mt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900">{t('finance.reports.totalLiabilitiesAndEquity')}</span>
                  <span className="text-gray-900">{formatCurrency(totalLiabilitiesAndEquity)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('finance.reports.title')}</h1>
          <p className="text-gray-600">{t('finance.reports.description')}</p>
        </div>
      </div>

      {/* Report Generation Controls */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('finance.reports.generateReport')}</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Select
            label={t('finance.reports.reportType')}
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            options={reportTypes}
          />
          <Input
            type="date"
            label={t('finance.reports.fromDate')}
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <Input
            type="date"
            label={t('finance.reports.toDate')}
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
          <div className="flex items-end">
            <Button 
              onClick={generateReport} 
              loading={loading}
              className="w-full"
            >
              {t('finance.reports.generateReport')}
            </Button>
          </div>
        </div>
      </div>

      {/* Export Actions */}
      {reportData && (
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={exportToPDF}>
            {t('finance.reports.exportPDF')}
          </Button>
          <Button variant="outline" onClick={exportToExcel}>
            {t('finance.reports.exportExcel')}
          </Button>
        </div>
      )}

      {/* Report Display */}
      {loading ? (
        <div className="bg-white shadow rounded-lg p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : reportData ? (
        reportType === 'income-statement' ? renderIncomeStatement() : renderBalanceSheet()
      ) : (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray-500">{t('finance.reports.noReportData')}</p>
          <p className="text-sm text-gray-400 mt-2">
            {t('finance.reports.generateReportToView')}
          </p>
        </div>
      )}
    </div>
  );
}