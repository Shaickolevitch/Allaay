import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AllayButton } from '@/components/business/allay-button';
import { TrustPath } from '@/components/business/trust-path';
import { ScoreDisplay } from '@/components/business/score-display';
import { CommentList } from '@/components/business/comment-list';
import { Avatar } from '@/components/ui/avatar';

export async function generateMetadata({
  params,
}: {
  params: { locale: string; id: string };
}): Promise<Metadata> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('business_pages')
    .select('name')
    .eq('id', params.id)
    .single();
  return { title: data?.name ? `${data.name} | Allay` : 'עסק | Allay' };
}

export default async function BusinessPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${params.locale}/auth/login`);

  // Fetch business + owner profile
  const { data: biz } = await supabase
    .from('business_pages')
    .select(`
      id, name, description, city, phone, website, facebook_url, instagram_url, tiktok_url, linkedin_url, cover_url,
      category:categories(name_he, emoji),
      owner_id,
      owner:users!business_pages_owner_id_fkey(id, name, profile_pic_url)
    `)
    .eq('id', params.id)
    .single();

  if (!biz) notFound();

  // My allay + score + comment
  const { data: myAllay } = await supabase
    .from('allays')
    .select('id')
    .eq('user_id', user.id)
    .eq('business_id', params.id)
    .single();

  const { data: myScore } = myAllay
    ? await supabase
        .from('scores')
        .select('professionalism, initiative, speed, communication, quality')
        .eq('user_id', user.id)
        .eq('business_id', params.id)
        .single()
    : { data: null };

  const { data: myComment } = myAllay
    ? await supabase
        .from('comments')
        .select('body')
        .eq('user_id', user.id)
        .eq('business_id', params.id)
        .single()
    : { data: null };

  // Aggregate scores
  const { data: scoreRows } = await supabase
    .from('scores')
    .select('professionalism, initiative, speed, communication, quality')
    .eq('business_id', params.id);

  const scoreAgg =
    scoreRows && scoreRows.length > 0
      ? {
          professionalism: avg(scoreRows, 'professionalism'),
          initiative: avg(scoreRows, 'initiative'),
          speed: avg(scoreRows, 'speed'),
          communication: avg(scoreRows, 'communication'),
          quality: avg(scoreRows, 'quality'),
          count: scoreRows.length,
        }
      : null;

  // Allay count
  const { count: allayCount } = await supabase
    .from('allays')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', params.id);

  // Trust paths (BFS via RPC)
  const { data: trustPaths } = await supabase.rpc('get_trust_paths', {
    viewer_id: user.id,
    business_id: params.id,
    max_hops: 6,
  });

  // Fetch user details for path nodes
  const allUserIds = new Set<string>();
  (trustPaths ?? []).forEach((tp: any) => {
    (tp.path as string[]).forEach((id) => allUserIds.add(id));
    allUserIds.add(tp.allayer_id);
  });
  allUserIds.delete(user.id);

  const { data: pathUsers } = allUserIds.size > 0
    ? await supabase
        .from('users')
        .select('id, name, profile_pic_url')
        .in('id', Array.from(allUserIds))
    : { data: [] };

  const userMap = Object.fromEntries((pathUsers ?? []).map((u: any) => [u.id, u]));

  // Comments
  const { data: comments } = await supabase
    .from('comments')
    .select(`
      id, body, created_at,
      user:users(id, name, profile_pic_url)
    `)
    .eq('business_id', params.id)
    .order('created_at', { ascending: false });

  const category = biz.category as any;
  const owner = biz.owner as any;

  return (
    <div className="page-wrapper pb-24 flex flex-col gap-4">
      {/* Cover photo */}
      {biz.cover_url && (
        <div className="relative w-full h-48 rounded-2xl overflow-hidden -mx-0 bg-slate-100">
          <Image src={biz.cover_url} alt={biz.name} fill className="object-cover" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3">
        {/* Category emoji as avatar */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-allay-blue/20 to-allay-indigo/20 flex items-center justify-center text-2xl shrink-0">
          {category?.emoji ?? '🏢'}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-allay-dark leading-tight">{biz.name}</h1>
          <p className="text-sm text-allay-muted mt-0.5">
            {category?.name_he ?? ''}
            {biz.city && ` • ${biz.city}`}
          </p>
          {/* Allay count */}
          <p className="text-xs text-allay-muted mt-1">
            <span className="font-semibold text-allay-blue">{allayCount ?? 0}</span> ✦ Allays
          </p>
        </div>
        {biz.owner_id === user.id && (
          <Link
            href={`/${params.locale}/business/${params.id}/edit`}
            className="text-xs bg-allay-blue/10 text-allay-blue px-2 py-1 rounded-full font-medium shrink-0 hover:bg-allay-blue/20 transition-colors"
          >
            ✏️ עריכה
          </Link>
        )}
      </div>

      {/* Description */}
      {biz.description && (
        <p className="text-sm text-allay-dark/80 leading-relaxed">{biz.description}</p>
      )}

      {/* Opened by */}
      {owner && (
        <Link
          href={
            owner.id === user.id
              ? `/${params.locale}/profile`
              : `/${params.locale}/profile/${owner.id}`
          }
          className="flex items-center gap-2 text-sm text-allay-muted hover:text-allay-blue transition-colors"
        >
          <Avatar src={owner.profile_pic_url} name={owner.name} size={20} />
          <span>
            נפתח על ידי{' '}
            <span className="font-medium text-allay-dark">{owner.name ?? 'משתמש'}</span>
          </span>
        </Link>
      )}

      {/* Contact & Links */}
      {(biz.phone || biz.website || (biz as any).facebook_url || (biz as any).instagram_url || (biz as any).tiktok_url || (biz as any).linkedin_url) && (
        <div className="flex flex-wrap gap-2">
          {biz.phone && (
            <a
              href={`tel:${biz.phone}`}
              className="flex items-center gap-1.5 text-sm text-allay-blue bg-allay-blue/5 px-3 py-1.5 rounded-full"
              dir="ltr"
            >
              📞 {biz.phone}
            </a>
          )}
          {biz.website && (
            <a href={biz.website} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-allay-blue bg-allay-blue/5 px-3 py-1.5 rounded-full">
              🌐 אתר
            </a>
          )}
          {(biz as any).facebook_url && (
            <a href={(biz as any).facebook_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-allay-blue bg-allay-blue/5 px-3 py-1.5 rounded-full">
              📘 Facebook
            </a>
          )}
          {(biz as any).instagram_url && (
            <a href={(biz as any).instagram_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-allay-blue bg-allay-blue/5 px-3 py-1.5 rounded-full">
              📸 Instagram
            </a>
          )}
          {(biz as any).tiktok_url && (
            <a href={(biz as any).tiktok_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-allay-blue bg-allay-blue/5 px-3 py-1.5 rounded-full">
              🎵 TikTok
            </a>
          )}
          {(biz as any).linkedin_url && (
            <a href={(biz as any).linkedin_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-allay-blue bg-allay-blue/5 px-3 py-1.5 rounded-full">
              💼 LinkedIn
            </a>
          )}
        </div>
      )}

      {/* Allay button */}
      <AllayButton
        businessId={params.id}
        allayId={myAllay?.id ?? null}
        existingScore={myScore ?? null}
        existingComment={myComment?.body ?? null}
        isOwner={biz.owner_id === user.id}
      />

      {/* Scores */}
      <ScoreDisplay agg={scoreAgg} />

      {/* Trust paths */}
      {(trustPaths ?? []).length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-allay-dark text-sm">
            מי ברשת שלך ממליץ?
          </h3>
          {(trustPaths as any[])
            .sort((a, b) => a.hops - b.hops)
            .slice(0, 10)
            .map((tp) => {
              const allayer = userMap[tp.allayer_id] ?? { id: tp.allayer_id, name: null, profile_pic_url: null };
              const pathNodes = (tp.path as string[])
                .slice(1, -1) // exclude viewer and allayer (they're shown separately)
                .map((id: string) => userMap[id] ?? { id, name: null, profile_pic_url: null });
              return (
                <TrustPath
                  key={tp.allayer_id}
                  allayerId={allayer.id}
                  allayerName={allayer.name}
                  allayerPic={allayer.profile_pic_url}
                  path={pathNodes}
                  hops={tp.hops}
                  locale={params.locale}
                />
              );
            })}
        </div>
      )}

      {/* Comments */}
      <CommentList comments={(comments ?? []) as any} locale={params.locale} />
    </div>
  );
}

function avg(rows: any[], key: string): number {
  if (!rows.length) return 0;
  return rows.reduce((s, r) => s + r[key], 0) / rows.length;
}
