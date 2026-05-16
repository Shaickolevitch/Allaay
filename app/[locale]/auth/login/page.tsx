import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OAuthButtons } from '@/components/auth/oauth-buttons';

export const metadata: Metadata = {
  title: 'כניסה',
};

interface LoginPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string; error?: string }>;
}

export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const { locale } = await params;
  const { next, error: errorParam } = await searchParams;

  // Already logged in?
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    redirect(next ?? `/${locale}/home`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href={`/${locale}`} className="inline-block">
            <span className="text-3xl font-bold text-allay-dark tracking-tight">
              Allay
            </span>
          </Link>
          <p className="mt-2 text-slate-500 text-sm">
            שש דרגות בינך לבין כל ממליץ
          </p>
        </div>

        {/* Card */}
        <div className="card space-y-6">
          <div className="text-center">
            <h1 className="text-xl font-bold text-slate-900">כניסה לעליי</h1>
            <p className="text-slate-500 text-sm mt-1">בחרו דרך כניסה מהירה</p>
          </div>

          {/* OAuth error from Supabase redirect */}
          {errorParam === 'callback' && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700 text-center">
              שגיאה בחזרה מספק הזיהוי. נסו שוב.
            </div>
          )}

          <OAuthButtons redirectTo={next} />

          <p className="text-center text-xs text-slate-400 leading-relaxed">
            בכניסה אתם מסכימים ל
            <Link href={`/${locale}/terms`} className="underline hover:text-slate-600">
              תנאי השימוש
            </Link>{' '}
            ול
            <Link href={`/${locale}/privacy`} className="underline hover:text-slate-600">
              מדיניות הפרטיות
            </Link>
            .
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link
            href={`/${locale}`}
            className="text-primary-600 hover:underline font-medium"
          >
            ← חזרה לדף הבית
          </Link>
        </p>
      </div>
    </div>
  );
}
