import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/supabase/database.types';

/**
 * Supabase OAuth callback handler.
 *
 * Flow:
 * 1. Supabase redirects here with ?code=...
 * 2. We exchange the code for a session (PKCE flow)
 * 3. We upsert the user row in `public.users` (first login creates it)
 * 4. We redirect to onboarding (if not complete) or home
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? `/${locale}/home`;
  const errorParam = searchParams.get('error');

  // Handle OAuth errors from the provider
  if (errorParam) {
    return NextResponse.redirect(
      `${origin}/${locale}/auth/login?error=callback`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${origin}/${locale}/auth/login?error=callback`
    );
  }

  const cookieStore = await cookies();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  // Exchange the code for a session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error('[auth/callback] exchangeCodeForSession error:', error);
    return NextResponse.redirect(
      `${origin}/${locale}/auth/login?error=callback`
    );
  }

  const user = data.user;

  // Upsert the user profile row (safe to call on every login)
  const { error: upsertError } = await supabase.from('users').upsert(
    {
      id: user.id,
      email: user.email!,
      oauth_provider: user.app_metadata?.provider ?? null,
      // Only set these on first insert; subsequent logins won't overwrite
    },
    {
      onConflict: 'id',
      ignoreDuplicates: true, // don't overwrite existing profile data
    }
  );

  if (upsertError) {
    console.error('[auth/callback] upsert error:', upsertError);
    // Don't block login — the profile row may already exist
  }

  // Check whether onboarding is complete
  const { data: profile } = await supabase
    .from('users')
    .select('onboarding_complete')
    .eq('id', user.id)
    .single();

  if (!profile?.onboarding_complete) {
    // First time (or incomplete onboarding) — go through onboarding
    const onboardingUrl = new URL(`/${locale}/onboarding`, origin);
    if (next !== `/${locale}/home`) {
      onboardingUrl.searchParams.set('next', next);
    }
    return NextResponse.redirect(onboardingUrl.toString());
  }

  // Fully onboarded — go to the intended destination
  return NextResponse.redirect(new URL(next, origin).toString());
}
