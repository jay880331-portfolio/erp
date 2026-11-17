import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ko', 'en'],
  defaultLocale: 'ko',
  localePrefix: 'always'
});

export const locales = ['ko', 'en'] as const;
export const defaultLocale = 'ko';
