import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import { EditProfileForm } from '@/components/profile/edit-profile-form';
import { PrivacySettings } from '@/components/profile/privacy-settings';

export const metadata: Metadata = { title: 'פרופיל | Allay' };

export default async function OwnProfilePage({
  params,
}: {
  params: { locale: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${params.locale}/auth/login`);

  const { data: profile } = await supabase
    .from('users')
    .select('id, name, bio, city, profile_pic_url, privacy_max_steps')
    .eq('id', user.id)
    .single();

  if (!profile) redirect(`/${params.locale}/onboarding`);

  // Count friends + allays
  const { count: friendCount } = await supabase
    .from('friendships')
    .select('*', { count: 'exact', head: true })
    .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
    .eq('status', 'accepted');

  const { count: allayCount } = await supabase
    .from('allays')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const handleSignOut = async () => {
    'use server';
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect(`/${params.locale}/auth/login`);
  };

  return (
    <div className="page-wrapper pb-24 flex flex-col gap-4">
      {/* Profile summary */}
      <div className="flex items-center gap-3 py-2">
        <Avatar
          src={profile.profile_pic_url}
          name={profile.name}
          size={56}
        />
        <div>
          <p className="font-bold text-allay-dark text-lg">
            {profile.name ?? 'משתמש'}
          </p>
          <p className="text-sm text-allay-muted">
            {friendCount ?? 0} חברים
          </p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href={`/${params.locale}/friends`}
          className="card text-center py-4 hover:border-allay-blue/30 transition-colors"
        >
          <p className="text-2xl font-bold text-allay-blue">{friendCount ?? 0}</p>
          <p className="text-xs text-allay-muted mt-0.5">חברים</p>
        </Link>
        <Link
          href={`/${params.locale}/my-allays`}
          className="card text-center py-4 hover:border-allay-blue/30 transition-colors"
        >
          <p className="text-2xl font-bold text-allay-blue">{allayCount ?? 0}</p>
          <p className="text-xs text-allay-muted mt-0.5">✦ Allays שלי</p>
        </Link>
      </div>

      <EditProfileForm profile={profile} />

      <PrivacySettings currentMaxSteps={profile.privacy_max_steps} />

      {/* Settings & account links */}
      <div className="card flex flex-col divide-y divide-slate-100">
        <Link
          href={`/${params.locale}/settings`}
          className="flex items-center justify-between py-3 px-1 text-sm text-allay-dark hover:text-allay-blue transition-colors"
        >
          <span className="flex items-center gap-2">
            <span className="text-base">⚙️</span>
            <span>
              <span className="block font-medium">הגדרות</span>
              <span className="block text-xs text-allay-muted font-normal">התראות, שפה ועוד</span>
            </span>
          </span>
          <span className="text-allay-muted text-xs">›</span>
        </Link>
        <Link
          href={`/${params.locale}/settings/privacy`}
          className="flex items-center justify-between py-3 px-1 text-sm text-allay-dark hover:text-allay-blue transition-colors"
        >
          <span className="flex items-center gap-2">
            <span className="text-base">🔒</span>
            <span>
              <span className="block font-medium">פרטיות</span>
              <span className="block text-xs text-allay-muted font-normal">מי רואה את הרשת שלך</span>
            </span>
          </span>
          <span className="text-allay-muted text-xs">›</span>
        </Link>
      </div>

      {/* Sign out */}
      <form action={handleSignOut}>
        <button
          type="submit"
          className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-500 font-medium text-sm hover:bg-slate-100 transition-colors"
        >
          התנתק
        </button>
      </form>
    </div>
  );
}
