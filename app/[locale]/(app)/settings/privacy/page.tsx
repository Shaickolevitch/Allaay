import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import { BridgeOptoutToggle } from '@/components/profile/bridge-optout-toggle';

export default async function PrivacySettingsPage({
  params,
}: {
  params: { locale: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${params.locale}/auth/login`);

  const { locale } = params;

  // My accepted friends
  const { data: friendships } = await supabase
    .from('friendships')
    .select('user_a_id, user_b_id')
    .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
    .eq('status', 'accepted');

  const friendIds = (friendships ?? []).map((f: any) =>
    f.user_a_id === user.id ? f.user_b_id : f.user_a_id
  );

  // Friend details
  const { data: friends } = friendIds.length > 0
    ? await supabase
        .from('users')
        .select('id, name, profile_pic_url, city')
        .in('id', friendIds)
        .order('name')
    : { data: [] };

  // My current opt-outs
  const { data: optouts } = await supabase
    .from('bridge_optouts')
    .select('excluded_viewer_id')
    .eq('user_id', user.id);

  const optedOutIds = new Set((optouts ?? []).map((o: any) => o.excluded_viewer_id));

  return (
    <div className="page-wrapper pb-24 space-y-5" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/settings`} className="text-allay-muted hover:text-allay-dark">
          ←
        </Link>
        <div>
          <h1 className="text-xl font-bold text-allay-dark">פרטיות גרף האמון</h1>
          <p className="text-sm text-allay-muted mt-0.5">
            בחר מי לא יראה אותך כחבר-מקשר בנתיבי ההמלצה
          </p>
        </div>
      </div>

      {/* Explainer card */}
      <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 text-sm text-blue-800 leading-relaxed">
        כשמישהו מחפש המלצות על עסק, Allay מציג את הנתיב דרך רשת החברים.
        כאן תוכל לבחור חברים שלא יוכלו לראות אותך כחלק מהנתיב — עדיין תמשיך להופיע ברשת שלך, רק לא אצלם.
      </div>

      {/* Friends list */}
      {(friends ?? []).length === 0 ? (
        <div className="card text-center py-10 space-y-3">
          <p className="text-allay-muted">עוד אין לך חברים ב-Allay</p>
          <Link href={`/${locale}/friends`} className="text-sm text-allay-blue hover:underline">
            הוסף חברים →
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {(friends as any[]).map((friend) => (
            <li key={friend.id} className="card flex items-center gap-3">
              <Avatar
                src={friend.profile_pic_url}
                name={friend.name}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-allay-dark truncate">{friend.name}</p>
                {friend.city && (
                  <p className="text-xs text-allay-muted">{friend.city}</p>
                )}
              </div>
              <BridgeOptoutToggle
                friendId={friend.id}
                isOptedOut={optedOutIds.has(friend.id)}
              />
            </li>
          ))}
        </ul>
      )}

      {optedOutIds.size > 0 && (
        <p className="text-center text-xs text-allay-muted">
          {optedOutIds.size} חבר/ה לא יראה אותך בנתיבי ההמלצה
        </p>
      )}
    </div>
  );
}
