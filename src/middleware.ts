import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // Get locale from pathname
  const pathname = request.nextUrl.pathname;
  const segments = pathname.split('/');
  const locale = segments[1];
  
  const response = intlMiddleware(request);
  
  // Add locale to headers so it can be accessed in request.ts
  if (response) {
    response.headers.set('x-locale', locale || 'ko');
    response.headers.set('x-pathname', pathname);
  }
  
  return response;
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};