'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/components/shared/Navbar'

interface User {
  id: string
  name: string
  email: string
  role: string
  tenantId: string
}

interface Tenant {
  id: string
  name: string
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  useEffect(() => {
    const token = localStorage.getItem('token')
    
    if (!token) {
      router.push(`/${locale}/auth/login`)
      return
    }

    // Decode token to get user info (simplified for demo)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      
      if (payload.exp < currentTime) {
        localStorage.removeItem('token')
        router.push(`/${locale}/auth/login`)
        return
      }

      // In a real app, you might fetch fresh user data here
      setUser({
        id: payload.userId || 'demo-user',
        name: payload.name || 'Admin User',
        email: payload.email || 'admin@demo.com',
        role: payload.role || 'admin',
        tenantId: payload.tenantId || 'demo-tenant',
      })

      setTenant({
        id: payload.tenantId || 'default-tenant',
        name: payload.tenantName || 'My Company',
      })
    } catch {
      localStorage.removeItem('token')
      router.push(`/${locale}/auth/login`)
      return
    }

    setLoading(false)
  }, [router, locale])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !tenant) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} tenant={tenant} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}