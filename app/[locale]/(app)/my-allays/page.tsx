import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const metadata: Metadata = { title: 'ה-Allays שלי | Allay' };

export default async function MyAllaysPage({
  params,
}: {
  params: { locale: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${params.locale}/auth/login`);

  const { locale } = params;

  const { data: allays } = await supabase
    .from('allays')
    .select(`
      id, created_at,
      business:business_pages(
        id, name, city, description,
        category:categories(name_he, emoji)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="page-wrapper pb-24 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-allay-dark">ה-Allays שלי</h1>
        <p className="text-sm text-allay-muted mt-0.5">
          {(allays ?? []).length === 1 ? '1 עסק שהמלצת עליו' : `${(allays ?? []).length} עסקים שהמלצת עליהם`}
        </p>
      </div>

      {/* List */}
      {(allays ?? []).length === 0 ? (
        <div className="card text-center py-12 space-y-4">
          <div className="text-5xl">✦</div>
          <h2 className="font-bold text-slate-900">עוד לא המלצת על עסקים</h2>
          <p className="text-slate-500 text-sm max-w-xs mx-auto">
            מצא עסק שאתה ממליץ עליו ולחץ ✦ Allay.
          </p>
          <Link
            href={`/${locale}/search`}
            className="inline-flex h-10 items-center justify-center rounded-xl brand-gradient px-5 text-white font-medium text-sm"
          >
            חפש עסקים
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {(allays as any[]).map((a) => {
            const biz = a.business as any;
            const cat = biz?.category as any;
            return (
              <li key={a.id}>
                <Link
                  href={`/${locale}/business/${biz?.id}`}
                  className="card flex items-start gap-3 hover:border-allay-blue/30 transition-colors block"
                >
                  <div className="w-12 h-12 rounded-xl bg-allay-blue/10 flex items-center justify-center text-2xl shrink-0">
                    {cat?.emoji ?? '🏢'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-allay-dark truncate">{biz?.name}</p>
                      <span className="text-xs text-allay-blue font-medium shrink-0">✦ Allay</span>
                    </div>
                    <p className="text-xs text-allay-muted mt-0.5">
                      {cat?.name_he ?? ''}
                      {biz?.city && ` • ${biz.city}`}
                    </p>
                    {biz?.description && (
                      <p className="text-xs text-allay-dark/70 mt-1 line-clamp-1">
                        {biz.description}
                      </p>
                    )}
                    <p className="text-xs text-allay-muted mt-1">
                      {new Date(a.created_at).toLocaleDateString('he-IL')}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
