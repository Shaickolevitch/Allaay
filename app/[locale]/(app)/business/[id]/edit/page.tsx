import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { BusinessEditForm } from '@/components/business/business-edit-form';
import { DeleteBusinessButton } from '@/components/business/delete-business-button';

export const metadata: Metadata = { title: 'עריכת עסק | Allay' };

export default async function BusinessEditPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${params.locale}/auth/login`);

  const { data: biz } = await supabase
    .from('business_pages')
    .select('id, name, description, city, phone, website, facebook_url, instagram_url, tiktok_url, linkedin_url, category_id, owner_id')
    .eq('id', params.id)
    .single();

  if (!biz) notFound();
  if (biz.owner_id !== user.id) redirect(`/${params.locale}/business/${params.id}`);

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name_he, emoji')
    .order('name_he');

  return (
    <div className="page-wrapper pb-24 space-y-5">
      <h1 className="text-xl font-bold text-allay-dark">עריכת עסק</h1>
      <BusinessEditForm
        business={biz}
        categories={categories ?? []}
        locale={params.locale}
      />
      <div className="pt-2">
        <DeleteBusinessButton businessId={biz.id} />
      </div>
    </div>
  );
}
