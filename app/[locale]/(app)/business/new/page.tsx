import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BusinessCreateForm } from '@/components/business/business-create-form';

export const metadata: Metadata = { title: 'הוסף עסק | Allay' };

export default async function NewBusinessPage({
  params,
}: {
  params: { locale: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${params.locale}/auth/login`);

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name_he, emoji')
    .order('display_order');

  return (
    <div className="page-wrapper pb-24">
      <h1 className="text-xl font-bold text-allay-dark mb-6">הוסף עסק</h1>
      <BusinessCreateForm categories={categories ?? []} locale={params.locale} />
    </div>
  );
}
