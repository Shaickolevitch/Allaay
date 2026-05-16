'use client';

import { useTransition } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { sendFriendRequestAction, acceptRequestAction } from '@/app/actions/friends';

interface ProfileHeaderProps {
  userId: string;
  name: string | null;
  profilePicUrl: string | null;
  bio: string | null;
  city: string | null;
  isOwnProfile: boolean;
  friendshipStatus: string | null;
  friendshipId: string | null;
  iAmRequester: boolean;
}

export function ProfileHeader({
  userId,
  name,
  profilePicUrl,
  bio,
  city,
  isOwnProfile,
  friendshipStatus,
  friendshipId,
  iAmRequester,
}: ProfileHeaderProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <Avatar src={profilePicUrl} name={name} size={80} />
      <div className="text-center">
        <h1 className="text-xl font-bold text-allay-dark">{name ?? 'משתמש'}</h1>
        {city && <p className="text-sm text-allay-muted mt-0.5">{city}</p>}
        {bio && (
          <p className="text-sm text-allay-dark/70 mt-2 max-w-xs mx-auto leading-relaxed">
            {bio}
          </p>
        )}
      </div>

      {!isOwnProfile && (
        <div className="mt-1">
          {friendshipStatus === 'accepted' ? (
            <span className="text-sm font-medium text-green-600 bg-green-50 border border-green-100 px-4 py-1.5 rounded-full">
              ✓ חבר/ה
            </span>
          ) : friendshipStatus === 'pending' ? (
            iAmRequester ? (
              <span className="text-sm font-medium text-allay-muted bg-gray-100 px-4 py-1.5 rounded-full">
                בקשה נשלחה
              </span>
            ) : (
              <button
                disabled={isPending}
                onClick={() =>
                  startTransition(() => acceptRequestAction(friendshipId!))
                }
                className="text-sm font-medium bg-allay-blue text-white px-4 py-1.5 rounded-full hover:bg-allay-indigo transition-colors disabled:opacity-60"
              >
                אשר בקשת חברות
              </button>
            )
          ) : (
            <button
              disabled={isPending}
              onClick={() =>
                startTransition(() => sendFriendRequestAction(userId))
              }
              className="text-sm font-medium bg-allay-blue text-white px-4 py-1.5 rounded-full hover:bg-allay-indigo transition-colors disabled:opacity-60"
            >
              {isPending ? '...' : '+ הוסף חבר/ה'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
