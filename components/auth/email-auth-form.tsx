'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function EmailAuthForm({
  locale,
  redirectTo,
}: {
  locale: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmSent, setConfirmSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/${locale}/auth/callback`,
        },
      });

      if (error) {
        setError(translateError(error.message));
        setLoading(false);
        return;
      }

      // If email confirmation is disabled in Supabase, user is logged in immediately
      if (data.session) {
        await upsertAndRedirect(data.user!.id, data.user!.email!, locale, redirectTo, router, supabase);
      } else {
        // Confirmation email sent
        setConfirmSent(true);
        setLoading(false);
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setError(translateError(error.message));
        setLoading(false);
        return;
      }

      await upsertAndRedirect(data.user.id, data.user.email!, locale, redirectTo, router, supabase);
    }
  }

  if (confirmSent) {
    return (
      <div className="text-center py-3 px-4 rounded-xl bg-blue-50 border border-blue-200">
        <p className="text-sm font-medium text-blue-800">📬 אשר את האימייל שלך</p>
        <p className="text-xs text-blue-600 mt-1">שלחנו לך קישור אימות — לחץ עליו ואז חזור להתחבר</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3" dir="rtl">
      <input
        type="email"
        required
        placeholder="אימייל"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input-base w-full"
        dir="ltr"
        autoComplete="email"
      />
      <input
        type="password"
        required
        minLength={6}
        placeholder="סיסמה (לפחות 6 תווים)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="input-base w-full"
        dir="ltr"
        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
      />

      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-2xl brand-gradient text-white font-semibold text-sm disabled:opacity-60 hover:opacity-90 transition-opacity"
      >
        {loading ? '...' : mode === 'signup' ? 'צור חשבון' : 'התחבר'}
      </button>

      <button
        type="button"
        onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}
        className="text-xs text-allay-muted hover:text-allay-blue transition-colors text-center"
      >
        {mode === 'signin' ? 'אין לך חשבון? צור אחד עכשיו' : 'כבר יש לך חשבון? התחבר'}
      </button>
    </form>
  );
}

async function upsertAndRedirect(
  userId: string,
  email: string,
  locale: string,
  redirectTo: string | undefined,
  router: ReturnType<typeof useRouter>,
  supabase: ReturnType<typeof createClient>
) {
  // Upsert profile row (mirrors what the OAuth callback does)
  await supabase.from('users').upsert(
    { id: userId, email, oauth_provider: 'email' },
    { onConflict: 'id', ignoreDuplicates: true }
  );

  // Check onboarding
  const { data: profile } = await supabase
    .from('users')
    .select('onboarding_complete')
    .eq('id', userId)
    .single();

  if (!profile?.onboarding_complete) {
    router.push(`/${locale}/onboarding`);
  } else {
    router.push(redirectTo ?? `/${locale}/home`);
  }
  router.refresh();
}

function translateError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'אימייל או סיסמה שגויים';
  if (msg.includes('Email not confirmed')) return 'אשר את האימייל שלך לפני הכניסה';
  if (msg.includes('User already registered')) return 'אימייל זה כבר רשום — נסה להתחבר';
  if (msg.includes('Password should be')) return 'הסיסמה חייבת להיות לפחות 6 תווים';
  return 'שגיאה. נסה שוב.';
}
