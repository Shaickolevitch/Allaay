import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function SettingsPage({
  params,
}: {
  params: { locale: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${params.locale}/auth/login`);

  const { locale } = params;

  const handleSignOut = async () => {
    'use server';
    const s = await createClient();
    await s.auth.signOut();
    redirect(`/${locale}/auth/login`);
  };

  const items = [
    {
      href: `/${locale}/profile`,
      icon: '👤',
      label: 'פרופיל',
      sub: 'שם, תמונה, עיר, ביוגרפיה',
    },
    {
      href: `/${locale}/settings/privacy`,
      icon: '🔒',
      label: 'פרטיות גרף האמון',
      sub: 'שלוט מי רואה אותך בנתיבי המלצה',
    },
    {
      href: `/${locale}/my-allays`,
      icon: '✦',
      label: 'ה-Allays שלי',
      sub: 'כל העסקים שהמלצת עליהם',
    },
    {
      href: `/${locale}/friends`,
      icon: '👥',
      label: 'חברים',
      sub: 'נהל חברויות ובקשות',
    },
  ];

  return (
    <div className="page-wrapper pb-24 space-y-5" dir="rtl">
      <h1 className="text-xl font-bold text-allay-dark">הגדרות</h1>

      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="card flex items-center gap-4 hover:border-allay-blue/30 transition-colors"
            >
              <span className="text-2xl shrink-0">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-allay-dark">{item.label}</p>
                <p className="text-xs text-allay-muted mt-0.5">{item.sub}</p>
              </div>
              <svg className="size-4 text-allay-muted shrink-0 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="m15 19-7-7 7-7"/>
              </svg>
            </Link>
          </li>
        ))}
      </ul>

      {/* Sign out */}
      <form action={handleSignOut}>
        <button
          type="submit"
          className="w-full py-3 rounded-xl border border-red-200 text-red-500 font-medium text-sm hover:bg-red-50 transition-colors"
        >
          התנתק
        </button>
      </form>

      <p className="text-center text-xs text-allay-muted">
        Allay — Phase 4 ✅
      </p>
    </div>
  );
}
