import Image from 'next/image';
import { cn } from '@/lib/utils';

type NamedSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  /** Named size OR pixel number (e.g. size={32}) */
  size?: NamedSize | number;
  className?: string;
}

const namedSizeMap: Record<NamedSize, { px: number; class: string }> = {
  xs: { px: 24, class: 'size-6 text-xs' },
  sm: { px: 32, class: 'size-8 text-sm' },
  md: { px: 40, class: 'size-10 text-sm' },
  lg: { px: 56, class: 'size-14 text-base' },
  xl: { px: 80, class: 'size-20 text-xl' },
};

function resolveSize(size: NamedSize | number = 'md'): { px: number; style?: React.CSSProperties } {
  if (typeof size === 'string') {
    return { px: namedSizeMap[size].px };
  }
  return { px: size, style: { width: size, height: size, fontSize: size * 0.4 } };
}

function sizeClass(size: NamedSize | number = 'md'): string {
  if (typeof size === 'string') return namedSizeMap[size].class;
  return ''; // inline style used for numeric sizes
}

/** Get initials from a display name (supports Hebrew) */
function initials(name?: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/** Deterministic color from name — 8 brand-adjacent hues */
function colorFromName(name?: string | null): string {
  const colors = [
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-cyan-500',
    'bg-pink-500',
  ];
  if (!name) return colors[0];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const { px, style } = resolveSize(size);
  const sc = sizeClass(size);

  if (src) {
    return (
      <div
        className={cn('relative overflow-hidden rounded-full shrink-0', sc, className)}
        style={style}
      >
        <Image
          src={src}
          alt={name ?? 'avatar'}
          width={px}
          height={px}
          className="object-cover w-full h-full"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full shrink-0 text-white font-semibold select-none',
        colorFromName(name),
        sc,
        className
      )}
      style={style}
      aria-label={name ?? undefined}
    >
      {initials(name)}
    </div>
  );
}
