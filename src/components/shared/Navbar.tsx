'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'

interface NavbarProps {
  user: {
    name: string
    email: string
    role: string
  }
  tenant: {
    name: string
  }
}

export default function Navbar({ user, tenant }: NavbarProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations()
  const locale = useLocale()

  // Helper function to check if a path is active
  const isActivePath = (path: string) => {
    const normalizedPath = pathname.replace(`/${locale}`, '')
    if (path === '/dashboard') {
      return normalizedPath === '/dashboard'
    }
    return normalizedPath.startsWith(path)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push(`/${locale}/auth/login`)
  }

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <img src="/logo.svg" alt="RIDGE ERP" className="h-10 w-10 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">
                {tenant.name} - RIDGE ERP
              </h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href={`/${locale}/dashboard`}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActivePath('/dashboard')
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('navigation.dashboard')}
              </Link>
              <Link
                href={`/${locale}/dashboard/finance`}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActivePath('/dashboard/finance')
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('navigation.finance')}
              </Link>
              <Link
                href={`/${locale}/dashboard/scm`}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActivePath('/dashboard/scm')
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('navigation.supplyChain')}
              </Link>
              <Link
                href={`/${locale}/dashboard/crm`}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActivePath('/dashboard/crm')
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('navigation.crm')}
              </Link>
              {user.role === 'admin' && (
                <Link
                  href={`/${locale}/dashboard/users`}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActivePath('/dashboard/users')
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {t('navigation.users')}
                </Link>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="ml-3 relative">
              <div>
                <button
                  type="button"
                  className="bg-white flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </button>
              </div>
              {isUserMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-gray-500">{user.email}</div>
                    <div className="text-xs text-gray-400 capitalize">{user.role}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {t('navigation.signOut')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Link
                href={`/${locale}/dashboard`}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActivePath('/dashboard')
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('navigation.dashboard')}
              </Link>
              
              <Link
                href={`/${locale}/dashboard/finance`}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActivePath('/dashboard/finance')
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('navigation.finance')}
              </Link>
              
              <Link
                href={`/${locale}/dashboard/scm`}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActivePath('/dashboard/scm')
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('navigation.supplyChain')}
              </Link>
              
              <Link
                href={`/${locale}/dashboard/crm`}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActivePath('/dashboard/crm')
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('navigation.crm')}
              </Link>
              
              {user.role === 'admin' && (
                <Link
                  href={`/${locale}/dashboard/users`}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActivePath('/dashboard/users')
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('navigation.users')}
                </Link>
              )}
            </div>
            
            {/* Mobile user menu */}
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user.name}</div>
                  <div className="text-sm font-medium text-gray-500">{user.email}</div>
                  <div className="text-xs text-gray-400 capitalize">{user.role}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  {t('navigation.signOut')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}