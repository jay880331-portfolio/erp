import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';

// 지원하는 로케일 정의 - routing.ts와 동일해야 함
export const locales = ['ko', 'en'] as const;
export const defaultLocale = 'ko';

export default getRequestConfig(async ({ locale }) => {
  // If locale is undefined, try to get it from the headers set by middleware
  let resolvedLocale = locale;
  
  if (!resolvedLocale) {
    const headersList = await headers();
    const localeFromHeader = headersList.get('x-locale');
    const pathname = headersList.get('x-pathname') || '';
    
    if (localeFromHeader && (locales as readonly string[]).includes(localeFromHeader)) {
      resolvedLocale = localeFromHeader;
    } else {
      // Last resort: extract from pathname
      const pathSegments = pathname.split('/');
      const localeFromPath = pathSegments[1];
      
      if ((locales as readonly string[]).includes(localeFromPath)) {
        resolvedLocale = localeFromPath;
      } else {
        resolvedLocale = defaultLocale;
      }
    }
  }
  
  if (!(locales as readonly string[]).includes(resolvedLocale)) {
    notFound();
  }

  try {
    const messages = (await import(`../messages/${resolvedLocale}.json`)).default;
    return {
      locale: resolvedLocale,
      messages
    };
  } catch {
    // Fallback to Korean messages
    const fallbackMessages = (await import(`../messages/ko.json`)).default;
    return {
      locale: 'ko',
      messages: fallbackMessages
    };
  }
});