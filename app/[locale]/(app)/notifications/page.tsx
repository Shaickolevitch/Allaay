import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import { markNotificationsReadAction } from '@/app/actions/notifications';

export const metadata: Metadata = { title: 'התראות | Allay' };

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'עכשיו';
  if (mins < 60) return `לפני ${mins} דק׳`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `לפני ${hrs} שע׳`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `לפני ${days} ימים`;
  return new Date(dateStr).toLocaleDateString('he-IL');
}

const notifLabel: Record<string, string> = {
  friend_request: 'שלח/ה לך בקשת חברות',
  friend_accepted: 'קיבל/ה את בקשת החברות שלך',
  new_allay: 'הוסיף/ה ✦ Allay לעסק',
  allay_on_yours: 'הוסיף/ה ✦ Allay לעסק שלך',
};

export default async function NotificationsPage({
  params,
}: {
  params: { locale: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${params.locale}/auth/login`);

  const { locale } = params;

  const { data: notifs } = await supabase
    .from('notifications')
    .select(`
      id, type, read, created_at,
      actor:users!notifications_actor_id_fkey(id, name, profile_pic_url),
      business:business_pages(id, name)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  const unreadIds = (notifs ?? []).filter((n) => !n.read).map((n) => n.id);

  return (
    <div className="page-wrapper pb-24 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-allay-dark">התראות</h1>
          <p className="text-sm text-allay-muted mt-0.5">עדכונים מהרשת שלך</p>
        </div>
        {unreadIds.length > 0 && (
          <form action={markNotificationsReadAction}>
            <input type="hidden" name="ids" value={JSON.stringify(unreadIds)} />
            <button
              type="submit"
              className="text-xs text-allay-blue hover:underline"
            >
              סמן הכל כנקרא
            </button>
          </form>
        )}
      </div>

      {/* List */}
      {(notifs ?? []).length === 0 ? (
        <div className="card text-center py-12 space-y-3">
          <div className="text-4xl">🔔</div>
          <p className="font-medium text-allay-dark">אין התראות עדיין</p>
          <p className="text-sm text-allay-muted">
            כשחברים ממליצים על עסקים תקבל התראה כאן.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-gray-100">
          {(notifs as any[]).map((n) => {
            const actor = n.actor as any;
            const biz = n.business as any;

            let href = '#';
            if (n.type === 'friend_request' || n.type === 'friend_accepted') {
              href = `/${locale}/friends`;
            } else if (biz?.id) {
              href = `/${locale}/business/${biz.id}`;
            }

            return (
              <li
                key={n.id}
                className={`py-3 first:pt-0 last:pb-0 ${!n.read ? '' : 'opacity-60'}`}
              >
                <Link href={href} className="flex items-start gap-3 group">
                  <div className="relative mt-0.5 shrink-0">
                    <Avatar
                      src={actor?.profile_pic_url ?? null}
                      name={actor?.name ?? null}
                      size={40}
                    />
                    {!n.read && (
                      <span className="absolute -top-0.5 -end-0.5 w-2.5 h-2.5 bg-allay-blue rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-allay-dark leading-snug">
                      <span className="font-semibold group-hover:text-allay-blue transition-colors">
                        {actor?.name ?? 'משתמש'}
                      </span>{' '}
                      {notifLabel[n.type] ?? ''}
                      {biz?.name && (
                        <span className="font-medium"> &ldquo;{biz.name}&rdquo;</span>
                      )}
                    </p>
                    <p className="text-xs text-allay-muted mt-0.5">{timeAgo(n.created_at)}</p>
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
