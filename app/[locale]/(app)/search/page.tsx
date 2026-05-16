import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { UserSearch } from '@/components/friends/user-search';
import { BusinessSearch } from '@/components/business/business-search';

export const metadata: Metadata = { title: 'חיפוש | Allay' };

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { tab?: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${params.locale}/auth/login`);

  const tab = searchParams.tab === 'people' ? 'people' : 'business';

  return (
    <div className="page-wrapper pb-24">
      <h1 className="text-xl font-bold text-allay-dark mb-4">חיפוש</h1>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-4">
        <Link
          href="?tab=business"
          className={`flex-1 text-center py-2.5 text-sm transition-colors ${
            tab === 'business'
              ? 'font-bold text-allay-blue border-b-2 border-allay-blue'
              : 'font-normal text-slate-500 hover:text-allay-dark'
          }`}
        >
          🏢 עסקים
        </Link>
        <Link
          href="?tab=people"
          className={`flex-1 text-center py-2.5 text-sm transition-colors ${
            tab === 'people'
              ? 'font-bold text-allay-blue border-b-2 border-allay-blue'
              : 'font-normal text-slate-500 hover:text-allay-dark'
          }`}
        >
          👥 אנשים
        </Link>
      </div>

      {tab === 'business' ? (
        <>
          <BusinessSearch locale={params.locale} />
          <div className="mt-4 text-center">
            <Link
              href={`/${params.locale}/business/new`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-allay-blue border border-allay-blue/40 rounded-xl px-4 py-2 hover:bg-allay-blue/5 transition-colors"
            >
              + הוסף עסק חדש
            </Link>
          </div>
        </>
      ) : (
        <UserSearch currentUserId={user.id} />
      )}
    </div>
  );
}
