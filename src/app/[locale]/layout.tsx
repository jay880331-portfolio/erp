import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { locales } from '../../i18n/routing'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '원주ERP - RIDGE ERP | 중소기업 맞춤형 클라우드 ERP 시스템',
  description: '원주 지역 중소기업을 위한 통합 ERP 솔루션. 재무관리, 재고관리, 고객관리를 하나의 시스템으로. 원주ERP RIDGE가 비즈니스 성장을 돕습니다.',
  keywords: '원주ERP, 원주 ERP시스템, 강원도 ERP, 중소기업 ERP, 클라우드 ERP, 재무관리, 재고관리, CRM, RIDGE ERP, 원주 기업관리시스템',
  authors: [{ name: 'RIDGE AI' }],
  creator: 'RIDGE AI',
  publisher: 'RIDGE AI',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/icon.svg', sizes: '32x32', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-icon.svg',
  },
  openGraph: {
    title: '원주ERP - RIDGE ERP | 중소기업 맞춤형 클라우드 ERP',
    description: '원주 지역 중소기업을 위한 통합 ERP 솔루션. 재무, 재고, 고객관리를 한번에.',
    url: 'https://ridgeerp.co.kr',
    siteName: 'RIDGE ERP',
    images: [
      {
        url: '/logo.svg',
        width: 400,
        height: 400,
        alt: 'RIDGE ERP Logo',
      }
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    languages: {
      'ko': '/ko',
      'en': '/en',
    }
  },
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}