'use client';

import { useState, useTransition } from 'react';
import { sendFriendRequestAction } from '@/app/actions/friends';

type Status = 'none' | 'pending_sent' | 'pending_received' | 'accepted';

export function AddFriendButton({
  targetId,
  initialStatus,
}: {
  targetId: string;
  initialStatus: Status;
}) {
  const [status, setStatus] = useState<Status>(initialStatus);
  const [isPending, startTransition] = useTransition();

  if (status === 'accepted') {
    return (
      <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
        ✓ חברים
      </div>
    );
  }

  if (status === 'pending_sent') {
    return (
      <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-allay-muted text-sm font-medium">
        ⏳ בקשה נשלחה
      </div>
    );
  }

  if (status === 'pending_received') {
    return (
      <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-allay-blue/10 border border-allay-blue/20 text-allay-blue text-sm font-medium">
        📬 שלח/ה לך בקשה
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        startTransition(async () => {
          await sendFriendRequestAction(targetId);
          setStatus('pending_sent');
        });
      }}
      disabled={isPending}
      className="flex items-center gap-1.5 px-4 py-2 rounded-xl brand-gradient text-white text-sm font-semibold disabled:opacity-60 hover:opacity-90 transition-opacity"
    >
      {isPending ? '...' : '+ הוסף חבר/ה'}
    </button>
  );
}
