import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isSeoLocale, getLocaleFromPath, type SeoLocale } from '@/lib/i18n';

const LOCALE_COOKIE = 'preferred-locale';

function parsePreferredLocale(acceptLanguage: string): SeoLocale | null {
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const parts = lang.trim().split(';q=');
      return {
        code: parts[0].split('-')[0].toLowerCase(),
        q: parts[1] ? parseFloat(parts[1]) : 1.0,
      };
    })
    .sort((a, b) => b.q - a.q);

  for (const { code } of languages) {
    if (code !== 'es' && isSeoLocale(code)) {
      return code as SeoLocale;
    }
  }
  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const currentLocale = getLocaleFromPath(pathname);

  // Already on a non-Spanish locale URL — update cookie and continue
  if (currentLocale !== 'es') {
    const response = NextResponse.next();
    response.cookies.set(LOCALE_COOKIE, currentLocale, {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
      sameSite: 'lax',
    });
    return response;
  }

  // On a Spanish (no-prefix) path — check if we should redirect
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;

  // User explicitly chose Spanish — respect that
  if (cookieLocale === 'es') {
    return NextResponse.next();
  }

  // Cookie says they prefer a non-Spanish SEO locale
  if (cookieLocale && isSeoLocale(cookieLocale) && cookieLocale !== 'es') {
    const url = request.nextUrl.clone();
    url.pathname = pathname === '/' ? `/${cookieLocale}` : `/${cookieLocale}${pathname}`;
    return NextResponse.redirect(url);
  }

  // No cookie — detect from Accept-Language header
  const acceptLanguage = request.headers.get('accept-language') ?? '';
  const detected = parsePreferredLocale(acceptLanguage);

  if (detected) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === '/' ? `/${detected}` : `/${detected}${pathname}`;
    const response = NextResponse.redirect(url);
    response.cookies.set(LOCALE_COOKIE, detected, {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
      sameSite: 'lax',
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // All paths except API routes, static files and Next.js internals
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
