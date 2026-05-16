'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function MagicLinkForm({ redirectTo }: { redirectTo?: string }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);

    const callbackUrl = new URL(
      '/he/auth/callback',
      window.location.origin
    );
    if (redirectTo) callbackUrl.searchParams.set('next', redirectTo);

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: callbackUrl.toString(),
        shouldCreateUser: true,
      },
    });

    setLoading(false);
    if (error) {
      setError('שגיאה בשליחת הקישור. נסו שוב.');
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="text-center py-3 px-4 rounded-xl bg-green-50 border border-green-200">
        <p className="text-sm font-medium text-green-800">📬 קישור נשלח לאימייל שלך</p>
        <p className="text-xs text-green-600 mt-1">לחץ על הקישור במייל כדי להיכנס</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2" dir="rtl">
      <input
        type="email"
        required
        placeholder="האימייל שלך"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input-base w-full"
        dir="ltr"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-2xl brand-gradient text-white font-medium text-sm disabled:opacity-60 hover:opacity-90 transition-opacity"
      >
        {loading ? 'שולח...' : 'שלח קישור כניסה למייל'}
      </button>
      {error && <p className="text-center text-sm text-red-600">{error}</p>}
    </form>
  );
}
