import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ridgeerp.co.kr'
  
  const routes = [
    '',
    '/auth/login',
    '/auth/register',
    '/dashboard',
    '/dashboard/finance',
    '/dashboard/finance/accounts',
    '/dashboard/finance/transactions',
    '/dashboard/finance/reports',
    '/dashboard/scm',
    '/dashboard/scm/items',
    '/dashboard/scm/inventory',
    '/dashboard/scm/inventory/movements',
    '/dashboard/crm',
    '/dashboard/crm/customers',
    '/dashboard/crm/orders',
    '/dashboard/users'
  ]
  
  const locales = ['ko', 'en']
  const sitemap: MetadataRoute.Sitemap = []
  
  locales.forEach(locale => {
    routes.forEach(route => {
      sitemap.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1.0 : route.includes('dashboard') ? 0.8 : 0.6,
      })
    })
  })
  
  return sitemap
}