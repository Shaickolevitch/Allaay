import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';

interface PathUser {
  id: string;
  name: string | null;
  profile_pic_url: string | null;
}

interface TrustPathProps {
  allayerId: string;
  allayerName: string | null;
  allayerPic: string | null;
  path: PathUser[];   // full path from viewer → allayer (excluding viewer)
  hops: number;
  locale: string;
}

const HOP_COLORS: Record<number, string> = {
  1: 'text-green-600 bg-green-50 border-green-200',
  2: 'text-blue-600 bg-blue-50 border-blue-200',
  3: 'text-purple-600 bg-purple-50 border-purple-200',
  4: 'text-orange-600 bg-orange-50 border-orange-200',
  5: 'text-gray-600 bg-gray-50 border-gray-200',
  6: 'text-gray-500 bg-gray-50 border-gray-100',
};

export function TrustPath({ allayerId, allayerName, allayerPic, path, hops, locale }: TrustPathProps) {
  const color = HOP_COLORS[hops] ?? HOP_COLORS[6];

  return (
    <div className={`rounded-2xl border p-3 ${color}`}>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Path chain — show intermediate nodes if hops > 1 */}
        {path.slice(0, -1).map((node, i) => (
          <div key={node.id} className="flex items-center gap-1">
            <Link href={`/${locale}/profile/${node.id}`}>
              <Avatar src={node.profile_pic_url} name={node.name} size={24} />
            </Link>
            <svg className="w-3 h-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </div>
        ))}

        {/* The allayer */}
        <Link href={`/${locale}/profile/${allayerId}`} className="flex items-center gap-1.5">
          <Avatar src={allayerPic} name={allayerName} size={28} />
          <span className="text-sm font-semibold">{allayerName ?? 'משתמש'}</span>
        </Link>

        {/* Hop badge */}
        <span className="ms-auto text-xs font-medium opacity-75 shrink-0">
          {hops === 1 ? 'חבר/ה ישיר/ה' : `${hops} קשרים`}
        </span>
      </div>
    </div>
  );
}
