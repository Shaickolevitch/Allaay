import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

interface LandingPageProps {
  params: Promise<{ locale: string }>;
}

export default async function LandingPage({ params }: LandingPageProps) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Authenticated users go straight to the app
  if (user) {
    redirect(`/${locale}/home`);
  }

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* ─── Header ───────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-slate-100">
        <div className="mx-auto max-w-5xl px-4 h-16 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight text-allay-dark">
            Allay
          </span>
          <Link
            href={`/${locale}/auth/login`}
            className="text-sm font-medium text-primary-600 hover:underline"
          >
            כניסה
          </Link>
        </div>
      </header>

      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 pt-20 pb-16 text-center">
        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-sm text-primary-700 font-medium mb-6">
          <span className="size-2 rounded-full bg-primary-500 animate-pulse" />
          רשת ההמלצות המבוססת על אמון אמיתי
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
          המלצות שאפשר{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-allay-indigo">
            לסמוך עליהן
          </span>
        </h1>

        <p className="mx-auto max-w-xl text-lg text-slate-600 mb-10">
          ראו בדיוק מי ממליץ וכיצד הוא מחובר אליכם — דרך המשפחה, החברים, הקולגות. עד שש דרגות הפרדה.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={`/${locale}/auth/login`}
            className="inline-flex h-14 items-center justify-center rounded-2xl brand-gradient px-8 text-white font-semibold text-lg shadow-lg hover:shadow-xl hover:opacity-95 transition-all duration-150 w-full sm:w-auto"
          >
            הצטרפו בחינם
          </Link>
          <Link
            href={`/${locale}/auth/login`}
            className="inline-flex h-14 items-center justify-center rounded-2xl border border-slate-200 bg-white px-8 text-slate-700 font-medium text-lg hover:bg-slate-50 transition-colors w-full sm:w-auto"
          >
            כבר יש לי חשבון
          </Link>
        </div>

        <p className="mt-4 text-sm text-slate-400">
          ללא פרסומות · ללא עמלות · פרטיות ברמה גבוהה
        </p>
      </section>

      {/* ─── Features ─────────────────────────────────────── */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-bold text-slate-900 mb-10">
            למה Allay שונה?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card text-center">
                <div className="text-3xl mb-3">{f.emoji}</div>
                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ─────────────────────────────────── */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-bold text-slate-900 mb-10">
            איך זה עובד?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-4">
                <div className="size-12 rounded-2xl brand-gradient flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {i + 1}
                </div>
                <h3 className="font-bold text-slate-900">{step.title}</h3>
                <p className="text-sm text-slate-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA bottom ───────────────────────────────────── */}
      <section className="brand-gradient py-16">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            מוכנים להצטרף?
          </h2>
          <p className="text-primary-100 mb-8">
            הצטרפו לרשת ההמלצות הראשונה המבוססת על אמון אמיתי.
          </p>
          <Link
            href={`/${locale}/auth/login`}
            className="inline-flex h-14 items-center justify-center rounded-2xl bg-white px-10 text-primary-700 font-bold text-lg hover:bg-primary-50 transition-colors shadow-lg"
          >
            הצטרפו עכשיו — בחינם
          </Link>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────── */}
      <footer className="py-8 text-center text-sm text-slate-400 border-t border-slate-100">
        © {new Date().getFullYear()} Allay · כל הזכויות שמורות
      </footer>
    </div>
  );
}

const features = [
  {
    emoji: '🔗',
    title: 'מבוסס אמון אמיתי',
    desc: 'כל המלצה מגיעה עם שרשרת הקשרים בינך לבין הממליץ. לא עוד "מישהו אמר".',
  },
  {
    emoji: '👥',
    title: '150 חברים, לא 1,500',
    desc: 'גבול דנבר: רשת קטנה ואיכותית. כל המלצה שווה יותר כשמכירים את האנשים.',
  },
  {
    emoji: '🚫',
    title: 'ללא פרסומות, לעולם',
    desc: 'אנחנו מרוויחים ממינויים של בעלי עסקים בלבד. האפליקציה שלכם תמיד נקייה.',
  },
];

const steps = [
  {
    title: 'חפשו עסק',
    desc: 'קטגוריה, מיקום, או חיפוש חופשי בשפה טבעית: "חשמלאי בתל אביב שחברים ממליצים עליו".',
  },
  {
    title: 'ראו את הקשרים',
    desc: 'כל ממליץ מוצג עם הדרך שלו אליכם — דרך אחותך, המורה של הילד שלך, הקולגה לשעבר.',
  },
  {
    title: 'Allay — המלצו',
    desc: 'היית שם? לחצו Allay, תנו ציון ב-5 קטגוריות, ועזרו לרשת לגדול.',
  },
];
