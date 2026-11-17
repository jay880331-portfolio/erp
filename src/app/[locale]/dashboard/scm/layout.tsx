import { getTranslations } from 'next-intl/server'

export default async function SCMLayout({
  children
}: {
  children: React.ReactNode
}) {
  const t = await getTranslations()
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('scm.title')}</h1>
        <p className="text-gray-600">{t('scm.description')}</p>
      </div>
      {children}
    </div>
  )
}