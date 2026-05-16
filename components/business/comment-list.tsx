import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';

interface Comment {
  id: string;
  body: string;
  created_at: string;
  user: {
    id: string;
    name: string | null;
    profile_pic_url: string | null;
  } | null;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'עכשיו';
  if (mins < 60) return `לפני ${mins} דקות`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `לפני ${hrs} שעות`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `לפני ${days} ימים`;
  return new Date(dateStr).toLocaleDateString('he-IL');
}

export function CommentList({
  comments,
  locale,
}: {
  comments: Comment[];
  locale: string;
}) {
  if (comments.length === 0) return null;

  return (
    <div className="card">
      <h3 className="font-bold text-allay-dark mb-3">
        חוות דעת
        <span className="ms-2 text-sm font-normal text-allay-muted">
          ({comments.length})
        </span>
      </h3>
      <ul className="flex flex-col divide-y divide-gray-100">
        {comments.map((c) => (
          <li key={c.id} className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-start gap-2">
              <Link href={`/${locale}/profile/${c.user?.id}`}>
                <Avatar
                  src={c.user?.profile_pic_url ?? null}
                  name={c.user?.name ?? null}
                  size={32}
                />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <Link
                    href={`/${locale}/profile/${c.user?.id}`}
                    className="text-sm font-semibold text-allay-dark hover:text-allay-blue transition-colors"
                  >
                    {c.user?.name ?? 'משתמש'}
                  </Link>
                  <span className="text-xs text-allay-muted">{timeAgo(c.created_at)}</span>
                </div>
                <p className="text-sm text-allay-dark/80 mt-0.5 leading-relaxed">{c.body}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
