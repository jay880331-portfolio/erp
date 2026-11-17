import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

export default async function DashboardPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params
  const t = await getTranslations()
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('dashboard.title')}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Financial Overview */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">$</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {t('dashboard.totalRevenue')}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        $0.00
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory Overview */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">📦</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {t('dashboard.totalItems')}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        0
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Overview */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">👥</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {t('dashboard.totalCustomers')}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        0
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t('dashboard.quickActions')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href={`/${locale}/dashboard/finance/accounts`} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow block">
                <div className="text-center">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="text-sm font-medium text-gray-900">{t('dashboard.createAccount')}</div>
                </div>
              </Link>
              
              <Link href={`/${locale}/dashboard/finance/transactions`} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow block">
                <div className="text-center">
                  <div className="text-2xl mb-2">📝</div>
                  <div className="text-sm font-medium text-gray-900">{t('dashboard.newTransaction')}</div>
                </div>
              </Link>
              
              <Link href={`/${locale}/dashboard/scm`} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow block">
                <div className="text-center">
                  <div className="text-2xl mb-2">📦</div>
                  <div className="text-sm font-medium text-gray-900">{t('dashboard.addItem')}</div>
                </div>
              </Link>
              
              <Link href={`/${locale}/dashboard/crm`} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow block">
                <div className="text-center">
                  <div className="text-2xl mb-2">👤</div>
                  <div className="text-sm font-medium text-gray-900">{t('dashboard.newCustomer')}</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t('dashboard.recentActivity')}</h2>
            <div className="bg-white shadow rounded-lg">
              <div className="p-6">
                <p className="text-gray-500 text-center">{t('dashboard.noRecentActivity')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}