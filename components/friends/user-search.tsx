'use client';

import { useState, useTransition, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Avatar } from '@/components/ui/avatar';
import { sendFriendRequestAction } from '@/app/actions/friends';
import clsx from 'clsx';

interface SearchResult {
  id: string;
  name: string | null;
  profile_pic_url: string | null;
  city: string | null;
  friendship_status: string | null;
  friendship_id: string | null;
  i_am_requester: boolean;
}

export function UserSearch({ currentUserId }: { currentUserId: string }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = (q: string) => {
    setQuery(q);
    if (debounce.current) clearTimeout(debounce.current);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }

    debounce.current = setTimeout(async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase.rpc('search_users', {
        search_query: q.trim(),
        current_user_id: currentUserId,
      });
      setResults(data ?? []);
      setLoading(false);
    }, 300);
  };

  const handleSendRequest = (toId: string) => {
    setSending(toId);
    startTransition(async () => {
      await sendFriendRequestAction(toId);
      // Optimistically update result
      setResults((prev) =>
        prev.map((r) =>
          r.id === toId
            ? { ...r, friendship_status: 'pending', i_am_requester: true }
            : r
        )
      );
      setSending(null);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search input */}
      <div className="relative">
        <svg
          className="absolute top-1/2 -translate-y-1/2 end-3 text-allay-muted w-5 h-5"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="חפש לפי שם..."
          className="input-base ps-4 pe-10 w-full"
          dir="rtl"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-2 border-allay-blue border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <ul className="flex flex-col gap-2">
          {results.map((user) => (
            <li key={user.id} className="card flex items-center gap-3">
              <Avatar
                src={user.profile_pic_url}
                name={user.name}
                size={44}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-allay-dark truncate">
                  {user.name ?? 'משתמש'}
                </p>
                {user.city && (
                  <p className="text-sm text-allay-muted">{user.city}</p>
                )}
              </div>
              <FriendButton
                status={user.friendship_status}
                iAmRequester={user.i_am_requester}
                sending={sending === user.id}
                onSend={() => handleSendRequest(user.id)}
              />
            </li>
          ))}
        </ul>
      )}

      {/* Empty state */}
      {!loading && query.length >= 2 && results.length === 0 && (
        <p className="text-center text-allay-muted py-8">לא נמצאו משתמשים</p>
      )}

      {/* Hint */}
      {query.length < 2 && (
        <p className="text-center text-allay-muted text-sm py-4">
          הקלד לפחות 2 תווים לחיפוש
        </p>
      )}
    </div>
  );
}

function FriendButton({
  status,
  iAmRequester,
  sending,
  onSend,
}: {
  status: string | null;
  iAmRequester: boolean;
  sending: boolean;
  onSend: () => void;
}) {
  if (status === 'accepted') {
    return (
      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
        חבר/ה
      </span>
    );
  }

  if (status === 'pending') {
    return (
      <span className="text-xs font-medium text-allay-muted bg-gray-100 px-2 py-1 rounded-full">
        {iAmRequester ? 'ממתין' : 'שלח לך בקשה'}
      </span>
    );
  }

  return (
    <button
      onClick={onSend}
      disabled={sending}
      className={clsx(
        'text-sm font-medium px-3 py-1.5 rounded-full transition-colors',
        'bg-allay-blue text-white hover:bg-allay-indigo',
        sending && 'opacity-60 cursor-not-allowed'
      )}
    >
      {sending ? '...' : 'הוסף'}
    </button>
  );
}
