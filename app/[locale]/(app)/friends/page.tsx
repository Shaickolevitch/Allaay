import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { FriendRequests } from '@/components/friends/friend-requests';
import { FriendList } from '@/components/friends/friend-list';

export const metadata: Metadata = { title: 'חברים | Allay' };

export default async function FriendsPage({
  params,
}: {
  params: { locale: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${params.locale}/auth/login`);

  // Incoming pending requests (user is user_b — canonical: b > a)
  const { data: rawRequests } = await supabase
    .from('friendships')
    .select(`
      id,
      status,
      created_at,
      requester:users!friendships_user_a_id_fkey(id, name, profile_pic_url, city)
    `)
    .eq('user_b_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  // Also check if user is user_a and request is incoming (edge case when a > b isn't possible due to canonical constraint, but requests from a to b where b = current are valid)
  // Note: canonical order means user_a_id < user_b_id always, so the "sender" is always user_a when they're smaller UUID. The actual sender is tracked separately — for now user_a is always the initiator.

  // All accepted friendships
  const { data: friendships } = await supabase
    .from('friendships')
    .select(`
      id,
      user_a_id,
      user_b_id,
      accepted_at,
      user_a:users!friendships_user_a_id_fkey(id, name, profile_pic_url, city),
      user_b:users!friendships_user_b_id_fkey(id, name, profile_pic_url, city)
    `)
    .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
    .eq('status', 'accepted')
    .order('accepted_at', { ascending: false });

  // Resolve the "other" user and fetch their circles
  const friends = await Promise.all(
    (friendships ?? []).map(async (f: any) => {
      const other = f.user_a_id === user.id ? f.user_a : f.user_b;
      const { data: circles } = await supabase
        .from('friend_circles')
        .select('circle')
        .eq('user_id', user.id)
        .eq('friend_id', other.id);
      return {
        ...other,
        circles: (circles ?? []).map((c: any) => c.circle),
        accepted_at: f.accepted_at,
      };
    })
  );

  return (
    <div className="page-wrapper pb-24 flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-allay-dark">חברים</h1>
        <p className="text-sm text-allay-muted mt-0.5">הרשת החברתית שלך</p>
      </div>

      <FriendRequests requests={(rawRequests ?? []) as any} />

      <FriendList friends={friends} locale={params.locale} />
    </div>
  );
}
