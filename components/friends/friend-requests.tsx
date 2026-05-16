'use client';

import { useTransition } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { acceptRequestAction, declineRequestAction } from '@/app/actions/friends';

interface Request {
  id: string;
  status: string;
  created_at: string;
  requester: {
    id: string;
    name: string | null;
    profile_pic_url: string | null;
    city: string | null;
  } | null;
}

export function FriendRequests({ requests }: { requests: Request[] }) {
  if (requests.length === 0) return null;

  return (
    <section>
      <h2 className="text-base font-bold text-allay-dark mb-3">
        בקשות חברות
        <span className="ms-2 text-sm font-medium text-white bg-allay-blue rounded-full px-2 py-0.5">
          {requests.length}
        </span>
      </h2>
      <ul className="flex flex-col gap-2">
        {requests.map((req) => (
          <RequestCard key={req.id} request={req} />
        ))}
      </ul>
    </section>
  );
}

function RequestCard({ request }: { request: Request }) {
  const [isPending, startTransition] = useTransition();
  const { requester } = request;
  if (!requester) return null;

  return (
    <li className="card flex items-center gap-3">
      <Avatar src={requester.profile_pic_url} name={requester.name} size={44} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-allay-dark">{requester.name ?? 'משתמש'}</p>
        {requester.city && (
          <p className="text-sm text-allay-muted">{requester.city}</p>
        )}
      </div>
      <div className="flex gap-2">
        <button
          disabled={isPending}
          onClick={() => startTransition(() => acceptRequestAction(request.id))}
          className="text-sm font-medium px-3 py-1.5 rounded-full bg-allay-blue text-white hover:bg-allay-indigo transition-colors disabled:opacity-60"
        >
          אשר
        </button>
        <button
          disabled={isPending}
          onClick={() => startTransition(() => declineRequestAction(request.id))}
          className="text-sm font-medium px-3 py-1.5 rounded-full bg-gray-100 text-allay-muted hover:bg-gray-200 transition-colors disabled:opacity-60"
        >
          דחה
        </button>
      </div>
    </li>
  );
}
