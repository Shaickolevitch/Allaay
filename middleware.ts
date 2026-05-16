import createIntlMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { type NextRequest } from 'next/server';
import { locales, defaultLocale } from './i18n';

const handleI18nRouting = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export async function middleware(request: NextRequest) {
  // Step 1: Resolve locale routing (adds /he prefix, handles redirects)
  const response = handleI18nRouting(request);

  // Step 2: Refresh the Supabase auth session on every request.
  // Supabase SSR requires this so server components always see a fresh session.
  // We write the refreshed cookies back to the same `response` object.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Calling getUser() triggers the session refresh side-effect.
  // We don't use the result here — auth guards live in server component layouts.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // Match all routes except Next.js internals and static files
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon\\.png|apple-touch-icon\\.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
