'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

type Provider = 'google' | 'apple' | 'facebook';

const providerConfig: Record<
  Provider,
  { label: string; icon: React.ReactNode; className: string }
> = {
  google: {
    label: 'המשיכו עם Google',
    icon: (
      <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
    ),
    className: 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50',
  },
  apple: {
    label: 'המשיכו עם Apple',
    icon: (
      <svg className="size-5" viewBox="0 0 814 1000" aria-hidden="true" fill="currentColor">
        <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.5-155.5-127.1c-43.4-77.6-90.9-198.3-90.9-321.2 0-190.4 124.4-291 246.6-291 74.5 0 136.6 49.3 183.5 49.3 44.9 0 115.2-52.3 201.3-52.3zm-39-253.7c37.9-44.8 65.5-107.3 65.5-169.8 0-8.9-.5-17.8-2-26.2-61.2 2.4-133.7 41.6-177.6 90.1-34.3 38.2-68 100.7-68 164.1 0 9.5 1.5 19 2.5 22 4 .5 10.5 1.5 17 1.5 55.5 0 122.6-37.8 162.6-81.7z"/>
      </svg>
    ),
    className: 'bg-black text-white hover:bg-slate-800',
  },
  facebook: {
    label: 'המשיכו עם Facebook',
    icon: (
      <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    className: 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50',
  },
};

interface OAuthButtonsProps {
  redirectTo?: string;
}

export function OAuthButtons({ redirectTo }: OAuthButtonsProps) {
  const [loading, setLoading] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function signIn(provider: Provider) {
    setError(null);
    setLoading(provider);

    // Build the OAuth callback URL — must be registered in Supabase dashboard
    const callbackUrl = new URL(
      `/he/auth/callback`,
      process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin
    );
    if (redirectTo) {
      callbackUrl.searchParams.set('next', redirectTo);
    }

    // Google needs offline access params; Apple & Facebook do not
    const googleParams =
      provider === 'google'
        ? { access_type: 'offline', prompt: 'consent' }
        : {};

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: callbackUrl.toString(),
        queryParams: googleParams,
      },
    });

    if (error) {
      setError('הכניסה נכשלה. נסו שוב.');
      setLoading(null);
    }
    // On success, the browser navigates away — no need to setLoading(null)
  }

  return (
    <div className="w-full space-y-3">
      {(['google', 'apple', 'facebook'] as Provider[]).map((provider) => {
        const config = providerConfig[provider];
        return (
          <button
            key={provider}
            onClick={() => signIn(provider)}
            disabled={loading !== null}
            className={`
              w-full h-14 flex items-center justify-center gap-3 rounded-2xl
              font-medium text-base transition-all duration-150
              disabled:opacity-60 disabled:cursor-not-allowed
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
              ${config.className}
            `}
          >
            {loading === provider ? (
              <svg
                className="size-5 animate-spin text-current"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              config.icon
            )}
            {config.label}
          </button>
        );
      })}

      {error && (
        <p className="text-center text-sm text-red-600 pt-1">{error}</p>
      )}
    </div>
  );
}
