import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import OnboardingFlow from '@/components/onboarding/onboarding-flow';

interface OnboardingPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
}

export default async function OnboardingPage({ params, searchParams }: OnboardingPageProps) {
  const { locale } = await params;
  const { next } = await searchParams;
  const supabase = await createClient();

  // Must be logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${locale}/auth/login`);
  }

  // Already completed onboarding AND phone verified?
  const { data: profile } = await supabase
    .from('users')
    .select('onboarding_complete, phone_verified, name, profile_pic_url, bio, city')
    .eq('id', user.id)
    .single();

  // Only skip if fully complete — existing users with phone_verified=false come here
  if (profile?.onboarding_complete && profile?.phone_verified) {
    redirect(next ?? `/${locale}/home`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary-50">
      <OnboardingFlow
        userId={user.id}
        locale={locale}
        redirectTo={next ?? `/${locale}/home`}
        // If profile is already complete, user just needs to verify phone
        phoneAlreadyVerified={profile?.phone_verified ?? false}
        initialData={{
          name: profile?.name ?? '',
          profilePicUrl: profile?.profile_pic_url ?? null,
          bio: profile?.bio ?? '',
          city: profile?.city ?? '',
        }}
      />
    </div>
  );
}
