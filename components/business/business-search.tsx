'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface BusinessResult {
  id: string;
  name: string;
  description: string | null;
  city: string | null;
  cover_url: string | null;
  allay_count: number;
}

export function BusinessSearch({ locale = 'he' }: { locale?: string }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BusinessResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = (q: string) => {
    setQuery(q);
    if (debounce.current) clearTimeout(debounce.current);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }

    debounce.current = setTimeout(async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase.rpc('search_businesses', {
        search_query: q.trim(),
        category_slug: null,
      });
      setResults(data ?? []);
      setLoading(false);
    }, 300);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <svg
          className="absolute top-1/2 -translate-y-1/2 end-3 text-allay-muted w-5 h-5"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="חפש עסק, שרברב, עיצוב..."
          className="input-base ps-4 pe-10 w-full"
          dir="rtl"
        />
      </div>

      {loading && (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-2 border-allay-blue border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && results.length > 0 && (
        <ul className="flex flex-col gap-2">
          {results.map((biz) => (
            <li key={biz.id}>
              <Link href={`/${locale}/business/${biz.id}`} className="card flex items-center gap-3 hover:border-allay-blue/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-allay-blue/10 flex items-center justify-center text-lg shrink-0">
                  🏢
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-allay-dark truncate">{biz.name}</p>
                  <p className="text-xs text-allay-muted">
                    {biz.city && `${biz.city} • `}
                    <span className="text-allay-blue font-medium">{biz.allay_count} ✦</span>
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {!loading && query.length >= 2 && results.length === 0 && (
        <div className="text-center py-8 text-allay-muted">
          <p>לא נמצאו עסקים עבור &ldquo;{query}&rdquo;</p>
          <Link
            href="/${locale}/business/new"
            className="inline-block mt-3 text-sm text-allay-blue hover:underline"
          >
            + הוסף את העסק הזה
          </Link>
        </div>
      )}

      {query.length < 2 && (
        <p className="text-center text-allay-muted text-sm py-4">
          הקלד לפחות 2 תווים לחיפוש עסקים
        </p>
      )}
    </div>
  );
}
