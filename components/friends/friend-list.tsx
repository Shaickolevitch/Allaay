'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import { removeFriendAction, setCirclesAction } from '@/app/actions/friends';

const CIRCLE_LABELS: Record<string, string> = {
  family: 'משפחה',
  extended_family: 'משפחה מורחבת',
  city: 'עיר',
  neighborhood: 'שכונה',
  street: 'רחוב',
  school: 'בית ספר',
  university: 'אוניברסיטה',
  work: 'עבודה',
  gym: 'חדר כושר',
  other: 'אחר',
};

interface Friend {
  id: string;
  name: string | null;
  profile_pic_url: string | null;
  city: string | null;
  circles: string[];
  accepted_at: string | null;
}

export function FriendList({
  friends,
  locale,
}: {
  friends: Friend[];
  locale: string;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (friends.length === 0) {
    return (
      <div className="card text-center py-12 space-y-4">
        <div className="text-4xl">👥</div>
        <div>
          <p className="font-bold text-slate-900">עדיין אין חברים</p>
          <p className="text-sm text-slate-500 mt-1">חפש אנשים שאתה מכיר</p>
        </div>
        <Link
          href={`/${locale}/search?tab=people`}
          className="inline-flex h-10 items-center justify-center rounded-xl brand-gradient px-5 text-white font-medium text-sm"
        >
          חפש חברים
        </Link>
      </div>
    );
  }

  return (
    <section>
      <h2 className="text-base font-bold text-allay-dark mb-3">
        חברים
        <span className="ms-2 text-sm text-allay-muted font-normal">
          {friends.length}/150
        </span>
      </h2>
      <ul className="flex flex-col gap-2">
        {friends.map((friend) => (
          <FriendCard
            key={friend.id}
            friend={friend}
            locale={locale}
            expanded={expandedId === friend.id}
            onToggle={() =>
              setExpandedId(expandedId === friend.id ? null : friend.id)
            }
          />
        ))}
      </ul>
    </section>
  );
}

function FriendCard({
  friend,
  locale,
  expanded,
  onToggle,
}: {
  friend: Friend;
  locale: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const [circles, setCircles] = useState<string[]>(friend.circles);
  const [isPending, startTransition] = useTransition();

  const toggleCircle = (circle: string) => {
    const next = circles.includes(circle)
      ? circles.filter((c) => c !== circle)
      : [...circles, circle];
    setCircles(next);
    startTransition(() => setCirclesAction(friend.id, next));
  };

  return (
    <li className="card">
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/profile/${friend.id}`}>
          <Avatar
            src={friend.profile_pic_url}
            name={friend.name}
            size={44}
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            href={`/${locale}/profile/${friend.id}`}
            className="font-medium text-allay-dark hover:text-allay-blue transition-colors"
          >
            {friend.name ?? 'משתמש'}
          </Link>
          <div className="flex flex-wrap gap-1 mt-0.5">
            {circles.length > 0 ? (
              circles.map((c) => (
                <span
                  key={c}
                  className="text-xs bg-allay-blue/10 text-allay-blue px-1.5 py-0.5 rounded-full"
                >
                  {CIRCLE_LABELS[c] ?? c}
                </span>
              ))
            ) : (
              <span className="text-xs text-allay-muted">ללא קטגוריה</span>
            )}
          </div>
        </div>
        <button
          onClick={onToggle}
          className="text-allay-muted hover:text-allay-dark transition-colors p-1"
          aria-label="פרטים"
        >
          <svg
            className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Expanded: circle picker + remove */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs font-medium text-allay-muted mb-2">קבוצות:</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {Object.entries(CIRCLE_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => toggleCircle(key)}
                disabled={isPending}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  circles.includes(key)
                    ? 'bg-allay-blue text-white border-allay-blue'
                    : 'bg-white text-allay-muted border-gray-200 hover:border-allay-blue'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <RemoveFriendButton friendId={friend.id} name={friend.name} />
        </div>
      )}
    </li>
  );
}

function RemoveFriendButton({
  friendId,
  name,
}: {
  friendId: string;
  name: string | null;
}) {
  const [confirm, setConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="text-xs text-red-400 hover:text-red-600 transition-colors"
      >
        הסר חבר
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-allay-muted">
        להסיר את {name ?? 'החבר'}?
      </span>
      <button
        onClick={() => startTransition(() => removeFriendAction(friendId))}
        disabled={isPending}
        className="text-xs text-red-500 font-medium hover:text-red-700 disabled:opacity-60"
      >
        כן
      </button>
      <button
        onClick={() => setConfirm(false)}
        className="text-xs text-allay-muted hover:text-allay-dark"
      >
        ביטול
      </button>
    </div>
  );
}
