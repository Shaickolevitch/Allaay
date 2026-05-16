import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import { AddFriendButton } from '@/components/profile/add-friend-button';

export default async function UserProfilePage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${params.locale}/auth/login`);

  // Redirect own profile to /profile
  if (params.id === user.id) redirect(`/${params.locale}/profile`);

  // Fetch target user
  const { data: profile } = await supabase
    .from('users')
    .select('id, name, bio, city, profile_pic_url')
    .eq('id', params.id)
    .single();

  if (!profile) notFound();

  // Friendship status between viewer and target
  const { data: friendship } = await supabase
    .from('friendships')
    .select('id, status, user_a_id, user_b_id')
    .or(
      `and(user_a_id.eq.${user.id},user_b_id.eq.${params.id}),and(user_a_id.eq.${params.id},user_b_id.eq.${user.id})`
    )
    .maybeSingle();

  type FriendStatus = 'none' | 'pending_sent' | 'pending_received' | 'accepted';
  let friendStatus: FriendStatus = 'none';
  if (friendship) {
    if (friendship.status === 'accepted') {
      friendStatus = 'accepted';
    } else if (friendship.status === 'pending') {
      // user_a is always the requester (canonical insert)
      friendStatus =
        friendship.user_a_id === user.id ? 'pending_sent' : 'pending_received';
    }
  }

  // Counts
  const [{ count: friendCount }, { count: allayCount }] = await Promise.all([
    supabase
      .from('friendships')
      .select('*', { count: 'exact', head: true })
      .or(`user_a_id.eq.${params.id},user_b_id.eq.${params.id}`)
      .eq('status', 'accepted'),
    supabase
      .from('allays')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', params.id),
  ]);

  // Their allayed businesses
  const { data: allays } = await supabase
    .from('allays')
    .select(`
      id, created_at,
      business:business_pages(id, name, city, cover_url,
        category:categories(name_he, emoji)
      )
    `)
    .eq('user_id', params.id)
    .order('created_at', { ascending: false })
    .limit(20);

  const p = profile as any;

  return (
    <div className="page-wrapper pb-24 flex flex-col gap-4">
      {/* Profile header */}
      <div className="flex items-center gap-4 py-2">
        <Avatar src={p.profile_pic_url} name={p.name} size={64} />
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-allay-dark">{p.name ?? 'משתמש'}</h1>
          {p.city && (
            <p className="text-sm text-allay-muted mt-0.5">📍 {p.city}</p>
          )}
        </div>
        <AddFriendButton targetId={params.id} initialStatus={friendStatus} />
      </div>

      {/* Bio */}
      {p.bio && (
        <p className="text-sm text-allay-dark/80 leading-relaxed">{p.bio}</p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center py-4">
          <p className="text-2xl font-bold text-allay-blue">{friendCount ?? 0}</p>
          <p className="text-xs text-allay-muted mt-0.5">חברים</p>
        </div>
        <div className="card text-center py-4">
          <p className="text-2xl font-bold text-allay-blue">{allayCount ?? 0}</p>
          <p className="text-xs text-allay-muted mt-0.5">✦ Allays</p>
        </div>
      </div>

      {/* Allayed businesses */}
      {(allays ?? []).length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="font-bold text-allay-dark text-sm">
            עסקים שהמליץ/ה עליהם
          </h2>
          <ul className="flex flex-col gap-2">
            {(allays as any[]).map((a) => {
              const biz = a.business;
              if (!biz) return null;
              const cat = biz.category as any;
              return (
                <li key={a.id}>
                  <Link
                    href={`/${params.locale}/business/${biz.id}`}
                    className="card flex items-center gap-3 hover:border-allay-blue/30 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-allay-blue/10 flex items-center justify-center text-xl shrink-0">
                      {cat?.emoji ?? '🏢'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-allay-dark truncate">{biz.name}</p>
                      <p className="text-xs text-allay-muted">
                        {cat?.name_he ?? ''}
                        {biz.city && ` • ${biz.city}`}
                      </p>
                    </div>
                    <span className="text-allay-muted text-sm">›</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {(allays ?? []).length === 0 && (
        <div className="card text-center py-10 text-allay-muted">
          <div className="text-3xl mb-2">✦</div>
          <p className="text-sm">עדיין לא המליץ/ה על עסקים</p>
        </div>
      )}
    </div>
  );
}
