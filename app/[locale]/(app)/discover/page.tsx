import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = { title: 'גלה עסקים | Allay' };

export default async function DiscoverPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { category?: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${params.locale}/auth/login`);

  const { locale } = params;
  const selectedSlug = searchParams.category ?? null;

  // Fetch all categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, slug, name_he, emoji')
    .order('name_he');

  // If a category is selected, fetch businesses in it
  let businesses: any[] = [];
  let selectedCategory: any = null;

  if (selectedSlug) {
    selectedCategory = (categories ?? []).find((c) => c.slug === selectedSlug);

    if (selectedCategory) {
      const { data } = await supabase
        .from('business_pages')
        .select(`
          id, name, description, city, cover_url,
          category:categories(name_he, emoji, slug),
          allay_count:allays(count)
        `)
        .eq('category_id', selectedCategory.id)
        .order('created_at', { ascending: false })
        .limit(50);

      businesses = (data ?? []).map((b: any) => ({
        ...b,
        allay_count: b.allay_count?.[0]?.count ?? 0,
      }));
    }
  } else {
    // Show all recent businesses with their category
    const { data } = await supabase
      .from('business_pages')
      .select(`
        id, name, description, city, cover_url,
        category:categories(name_he, emoji, slug),
        allay_count:allays(count)
      `)
      .order('created_at', { ascending: false })
      .limit(30);

    businesses = (data ?? []).map((b: any) => ({
      ...b,
      allay_count: b.allay_count?.[0]?.count ?? 0,
    }));
  }

  return (
    <div className="page-wrapper pb-24 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-allay-dark">גלה עסקים</h1>
        <p className="text-sm text-allay-muted mt-0.5">עיין לפי קטגוריה</p>
      </div>

      {/* Category chips */}
      <div className="relative -mx-4">
      <div className="flex gap-2 overflow-x-auto pb-1 px-4 scrollbar-none">
        <Link
          href={`/${locale}/discover`}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            !selectedSlug
              ? 'bg-allay-blue text-white border-allay-blue'
              : 'bg-white text-allay-dark border-slate-200 hover:border-allay-blue/40'
          }`}
        >
          🌟 הכל
        </Link>
        {(categories ?? []).map((cat) => (
          <Link
            key={cat.id}
            href={`/${locale}/discover?category=${cat.slug}`}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              selectedSlug === cat.slug
                ? 'bg-allay-blue text-white border-allay-blue'
                : 'bg-white text-allay-dark border-slate-200 hover:border-allay-blue/40'
            }`}
          >
            {cat.emoji} {cat.name_he}
          </Link>
        ))}
      </div>
      {/* Fade gradient indicating scroll */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-slate-50 to-transparent" />
      </div>

      {/* Section title */}
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-allay-dark">
          {selectedCategory
            ? `${selectedCategory.emoji} ${selectedCategory.name_he}`
            : 'עסקים אחרונים'}
        </h2>
        <span className="text-xs text-allay-muted">{businesses.length === 1 ? '1 עסק' : `${businesses.length} עסקים`}</span>
      </div>

      {/* Business grid */}
      {businesses.length === 0 ? (
        <div className="card text-center py-12 space-y-3">
          <div className="text-4xl">🔍</div>
          <p className="font-medium text-allay-dark">אין עסקים בקטגוריה זו עדיין</p>
          <Link
            href={`/${locale}/business/new`}
            className="inline-flex h-10 items-center justify-center rounded-xl brand-gradient px-5 text-white font-medium text-sm"
          >
            הוסף עסק ראשון
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {businesses.map((biz) => {
            const cat = biz.category as any;
            return (
              <li key={biz.id}>
                <Link
                  href={`/${locale}/business/${biz.id}`}
                  className="card overflow-hidden hover:border-allay-blue/30 transition-colors block p-0"
                >
                  {/* Cover photo strip */}
                  {biz.cover_url && (
                    <div className="relative w-full h-32">
                      <Image
                        src={biz.cover_url}
                        alt={biz.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex items-start gap-3 p-3">
                    <div className="w-11 h-11 rounded-xl bg-allay-blue/10 flex items-center justify-center text-xl shrink-0">
                      {cat?.emoji ?? '🏢'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-allay-dark truncate">{biz.name}</p>
                      <p className="text-xs text-allay-muted mt-0.5">
                        {cat?.name_he ?? ''}
                        {biz.city && ` • ${biz.city}`}
                      </p>
                      {biz.description && (
                        <p className="text-xs text-allay-dark/70 mt-1 line-clamp-2 leading-relaxed">
                          {biz.description}
                        </p>
                      )}
                      <p className="text-xs text-allay-blue font-medium mt-1.5">
                        {biz.allay_count} ✦ Allays
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {/* Add business CTA */}
      <div className="text-center pt-2">
        <Link
          href={`/${locale}/business/new`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-allay-blue border border-allay-blue/40 rounded-xl px-4 py-2 hover:bg-allay-blue/5 transition-colors"
        >
          + הוסף עסק חדש
        </Link>
      </div>
    </div>
  );
}
