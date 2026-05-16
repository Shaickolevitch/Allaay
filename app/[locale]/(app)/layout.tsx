import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BottomNav from '@/components/nav/bottom-nav';

interface AppLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

/**
 * Auth-gated layout for all app routes (/home, /search, /profile, etc.)
 * Server component — checks session on every request.
 */
export default async function AppLayout({ children, params }: AppLayoutProps) {
  const { locale } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login`);
  }

  // Check if onboarding is complete and phone is verified
  const { data: profile } = await supabase
    .from('users')
    .select('onboarding_complete, phone_verified, name')
    .eq('id', user.id)
    .single();

  if (!profile?.onboarding_complete || !profile?.phone_verified) {
    redirect(`/${locale}/onboarding`);
  }

  // Badge counts for bottom nav
  const [{ count: pendingCount }, { count: unreadNotifCount }] = await Promise.all([
    supabase
      .from('friendships')
      .select('*', { count: 'exact', head: true })
      .eq('user_b_id', user.id)
      .eq('status', 'pending'),
    supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-1 pb-20">{children}</main>
      <BottomNav
        locale={locale}
        pendingCount={pendingCount ?? 0}
        unreadNotifCount={unreadNotifCount ?? 0}
      />
    </div>
  );
}
