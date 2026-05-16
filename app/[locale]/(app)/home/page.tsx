import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Avatar } from '@/components/ui/avatar';
import { InviteButton } from '@/components/ui/invite-button';

export const metadata: Metadata = { title: 'בית | Allay' };

export default async function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('users')
    .select('name, profile_pic_url, city')
    .eq('id', user!.id)
    .single();

  const { count: friendCount } = await supabase
    .from('friendships')
    .select('*', { count: 'exact', head: true })
    .or(`user_a_id.eq.${user!.id},user_b_id.eq.${user!.id}`)
    .eq('status', 'accepted');

  const { count: allayCount } = await supabase
    .from('allays')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user!.id);

  // My owned businesses
  const { data: myBusinesses } = await supabase
    .from('business_pages')
    .select('id, name, city, category:categories(name_he, emoji)')
    .eq('owner_id', user!.id)
    .order('created_at', { ascending: false });

  // Friend IDs for the feed
  const { data: friendships } = await supabase
    .from('friendships')
    .select('user_a_id, user_b_id')
    .or(`user_a_id.eq.${user!.id},user_b_id.eq.${user!.id}`)
    .eq('status', 'accepted');

  const friendIds = (friendships ?? []).map((f) =>
    f.user_a_id === user!.id ? f.user_b_id : f.user_a_id
  );

  // Recent allays by friends (the feed)
  const { data: feedAllays } = friendIds.length > 0
    ? await supabase
        .from('allays')
        .select(`
          id,
          created_at,
          user:users(id, name, profile_pic_url),
          business:business_pages(
            id, name, city,
            category:categories(name_he, emoji)
          )
        `)
        .in('user_id', friendIds)
        .order('created_at', { ascending: false })
        .limit(20)
    : { data: [] };

  return (
    <div className="page-wrapper pb-24 space-y-5">
      {/* ─── Top bar ──────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-sm">שלום,</p>
          <h1 className="text-xl font-bold text-slate-900">
            {profile?.name ?? 'אורח'} 👋
          </h1>
        </div>
        <Link href={`/${locale}/profile`}>
          <Avatar src={profile?.profile_pic_url} name={profile?.name} size="md" />
        </Link>
      </div>

      {/* ─── Search bar ───────────────────────────────── */}
      <Link
        href={`/${locale}/search`}
        className="w-full h-12 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-slate-400 text-sm shadow-sm hover:shadow-md transition-shadow"
      >
        <svg className="size-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/>
        </svg>
        חפשו עסק, שרברב, עיצוב...
      </Link>

      {/* ─── Welcome banner (shown only when no friends yet) ─── */}
      {(friendCount ?? 0) === 0 && (
        <div className="rounded-2xl bg-gradient-to-br from-allay-blue/10 to-allay-indigo/10 border border-allay-blue/20 p-4 space-y-1.5">
          <p className="font-bold text-allay-dark text-sm">ברוכים הבאים ל-Allay ✦</p>
          <p className="text-xs text-allay-dark/70 leading-relaxed">
            Allay היא רשת המלצות מבוססת אמון — המלצות מגיעות רק מחברים וחברים של חברים, לא מזרים.
            הוסיפו חברים כדי להתחיל לגלות עסקים שכדאי לנסות.
          </p>
        </div>
      )}

      {/* ─── Quick stats ──────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {(friendCount ?? 0) === 0 ? (
          <InviteButton className="card col-span-1 flex flex-col items-center justify-center py-4 gap-1 hover:border-allay-blue/30 transition-colors text-center w-full" />
        ) : (
          <Link href={`/${locale}/friends`} className="card text-center py-4 hover:border-allay-blue/30 transition-colors">
            <p className="text-2xl font-bold text-allay-blue">{friendCount ?? 0}</p>
            <p className="text-xs text-allay-muted mt-0.5">חברים</p>
          </Link>
        )}
        <Link href={`/${locale}/my-allays`} className="card text-center py-4 hover:border-allay-blue/30 transition-colors">
          <p className="text-2xl font-bold text-allay-blue">{allayCount ?? 0}</p>
          <p className="text-xs text-allay-muted mt-0.5">✦ Allays שלי</p>
        </Link>
      </div>

      {/* ─── My Businesses ────────────────────────────── */}
      {(myBusinesses ?? []).length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-allay-dark">העסקים שלי</h2>
            <Link
              href={`/${locale}/business/new`}
              className="text-xs text-allay-blue font-medium hover:underline"
            >
              + הוסף עסק
            </Link>
          </div>
          <ul className="flex flex-col gap-2">
            {(myBusinesses as any[]).map((biz) => {
              const cat = biz.category as any;
              return (
                <li key={biz.id} className="flex items-center gap-2">
                  <Link
                    href={`/${locale}/business/${biz.id}`}
                    className="card flex-1 flex items-center gap-3 hover:border-allay-blue/30 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-allay-blue/10 flex items-center justify-center text-lg shrink-0">
                      {cat?.emoji ?? '🏢'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-allay-dark truncate text-sm">{biz.name}</p>
                      <p className="text-xs text-allay-muted truncate">
                        {cat?.name_he ?? ''}
                        {biz.city && ` • ${biz.city}`}
                      </p>
                    </div>
                  </Link>
                  <Link
                    href={`/${locale}/business/${biz.id}/edit`}
                    className="card shrink-0 w-10 h-10 flex items-center justify-center text-allay-muted hover:text-allay-blue hover:border-allay-blue/30 transition-colors"
                  >
                    ✏️
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ─── Feed ─────────────────────────────────────── */}
      {(feedAllays ?? []).length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-allay-dark">מה ממליצים החברים שלך</h2>
          </div>
          <ul className="flex flex-col gap-3">
            {(feedAllays as any[]).map((a) => {
              const biz = a.business as any;
              const author = a.user as any;
              const cat = biz?.category as any;
              return (
                <li key={a.id}>
                  <Link href={`/${locale}/business/${biz?.id}`} className="card block hover:border-allay-blue/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-allay-blue/10 flex items-center justify-center text-lg shrink-0">
                        {cat?.emoji ?? '🏢'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-allay-dark truncate">{biz?.name}</p>
                        <p className="text-xs text-allay-muted mt-0.5">
                          {cat?.name_he ?? ''}
                          {biz?.city && ` • ${biz.city}`}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Avatar src={author?.profile_pic_url} name={author?.name} size={16} />
                          <p className="text-xs text-allay-muted">
                            <span className="font-medium text-allay-dark">{author?.name}</span>
                            {' '}הוסיף ✦ Allay
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="card text-center py-8 space-y-2">
            <div className="text-4xl">✦</div>
            <p className="font-bold text-allay-dark">עדיין אין המלצות בפיד</p>
            <p className="text-allay-muted text-sm max-w-xs mx-auto leading-relaxed">
              כשחברים שלך ימליצו על עסקים, תראו את זה כאן.
            </p>
          </div>
          <Link
            href={`/${locale}/search?tab=people`}
            className="w-full py-3 rounded-xl brand-gradient text-white font-semibold text-sm text-center"
          >
            מצאו חברים →
          </Link>
          <Link
            href={`/${locale}/discover`}
            className="w-full py-3 rounded-xl border border-slate-200 bg-white text-allay-dark font-medium text-sm text-center hover:bg-slate-50 transition-colors"
          >
            גלו עסקים עכשיו
          </Link>
        </div>
      )}
    </div>
  );
}
