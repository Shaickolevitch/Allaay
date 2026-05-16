'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  labelHe: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  badge?: number;
}

function HomeIcon({ filled }: { filled?: boolean }) {
  return filled ? (
    <svg className="size-6" viewBox="0 0 24 24" fill="currentColor"><path d="M10.707 2.293a1 1 0 0 1 1.414 0l7 7a1 1 0 0 1-1.414 1.414L17 10.414V17a2 2 0 0 1-2 2h-2a1 1 0 0 1-1-1v-3H12a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H8a2 2 0 0 1-2-2v-6.586l-.707.707a1 1 0 0 1-1.414-1.414l7-7z"/></svg>
  ) : (
    <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955a.75.75 0 0 1 1.06 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>
  );
}

function DiscoverIcon({ filled }: { filled?: boolean }) {
  return filled ? (
    <svg className="size-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.687 5.25 1.823V4.533ZM12.75 20.573A8.236 8.236 0 0 1 18 18.75c.968 0 1.798.134 2.75.408a.75.75 0 0 0 1-.707V4.262a.75.75 0 0 0-.5-.707A9.734 9.734 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.04Z" />
    </svg>
  ) : (
    <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function FriendsIcon({ filled }: { filled?: boolean }) {
  return filled ? (
    <svg className="size-6" viewBox="0 0 24 24" fill="currentColor"><path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z"/></svg>
  ) : (
    <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"/></svg>
  );
}

function BellIcon({ filled }: { filled?: boolean }) {
  return filled ? (
    <svg className="size-6" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0 1 13.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 0 1-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 1 1-7.48 0 24.585 24.585 0 0 1-4.831-1.244.75.75 0 0 1-.297-1.206A6.994 6.994 0 0 0 5.25 9.75V9Z" clipRule="evenodd"/></svg>
  ) : (
    <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"/></svg>
  );
}

function UserIcon({ filled }: { filled?: boolean }) {
  return filled ? (
    <svg className="size-6" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd"/></svg>
  ) : (
    <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/></svg>
  );
}

interface BottomNavProps {
  locale: string;
  pendingCount?: number;
  unreadNotifCount?: number;
}

export default function BottomNav({ locale, pendingCount = 0, unreadNotifCount = 0 }: BottomNavProps) {
  const pathname = usePathname();

  const items = [
    {
      href: `/${locale}/home`,
      labelHe: 'בית',
      icon: <HomeIcon />,
      activeIcon: <HomeIcon filled />,
      badge: 0,
    },
    {
      href: `/${locale}/discover`,
      labelHe: 'גלו',
      icon: <DiscoverIcon />,
      activeIcon: <DiscoverIcon filled />,
      badge: 0,
    },
    {
      href: `/${locale}/friends`,
      labelHe: 'חברים',
      icon: <FriendsIcon />,
      activeIcon: <FriendsIcon filled />,
      badge: pendingCount,
    },
    {
      href: `/${locale}/notifications`,
      labelHe: 'התראות',
      icon: <BellIcon />,
      activeIcon: <BellIcon filled />,
      badge: unreadNotifCount,
    },
    {
      href: `/${locale}/profile`,
      labelHe: 'פרופיל',
      icon: <UserIcon />,
      activeIcon: <UserIcon filled />,
      badge: 0,
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-50 safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-2xl mx-auto px-1">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors',
                isActive
                  ? 'text-primary-600'
                  : 'text-slate-400 hover:text-slate-600'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive ? item.activeIcon : item.icon}
              <span className="text-[10px] font-medium">{item.labelHe}</span>
              {item.badge > 0 && (
                <span className="absolute top-1 end-1.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold px-0.5">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
