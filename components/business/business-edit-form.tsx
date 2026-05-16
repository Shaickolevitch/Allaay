'use client';

import { useState, useRef, useTransition, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { updateBusinessAction } from '@/app/actions/business';
import { LinkFields } from './link-fields';
import { Toast } from '@/components/ui/toast';

interface Category {
  id: string;
  name_he: string;
  emoji: string;
}

interface Business {
  id: string;
  name: string;
  description: string | null;
  city: string | null;
  phone: string | null;
  website: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  linkedin_url: string | null;
  category_id: string | null;
  cover_url?: string | null;
}

export function BusinessEditForm({
  business,
  categories,
  locale,
}: {
  business: Business;
  categories: Category[];
  locale: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const hideToast = useCallback(() => setShowToast(false), []);
  const [coverPreview, setCoverPreview] = useState<string | null>(
    business.cover_url ?? null
  );
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await updateBusinessAction(business.id, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setShowToast(true);
        router.refresh();
      }
    });
  };

  return (
    <>
    <Toast message="השינויים נשמרו בהצלחה" show={showToast} onHide={hideToast} />
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" dir="rtl">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Cover photo */}
      <div>
        <label className="text-sm font-medium text-allay-dark block mb-2">
          תמונת כיסוי
        </label>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative w-full h-40 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden hover:border-allay-blue/50 transition-colors"
        >
          {coverPreview ? (
            <Image src={coverPreview} alt="cover" fill className="object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-allay-muted">
              <span className="text-3xl">📷</span>
              <span className="text-xs">לחץ לשינוי תמונה</span>
            </div>
          )}
          {coverPreview && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white text-sm font-medium">שנה תמונה</span>
            </div>
          )}
        </button>
        <input
          ref={fileRef}
          name="cover_photo"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-allay-dark" htmlFor="name">
          שם העסק *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={business.name}
          className="input-base"
          placeholder="שם העסק"
        />
      </div>

      {/* Category */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-allay-dark" htmlFor="category_id">
          קטגוריה
        </label>
        <select
          id="category_id"
          name="category_id"
          defaultValue={business.category_id ?? ''}
          className="input-base"
        >
          <option value="">בחר קטגוריה</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.name_he}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-allay-dark" htmlFor="description">
          תיאור
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={business.description ?? ''}
          className="input-base resize-none"
          placeholder="תיאור קצר של העסק..."
        />
      </div>

      {/* City */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-allay-dark" htmlFor="city">
          עיר
        </label>
        <input
          id="city"
          name="city"
          type="text"
          defaultValue={business.city ?? ''}
          className="input-base"
          placeholder="תל אביב"
        />
      </div>

      {/* Phone */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-allay-dark" htmlFor="phone">
          טלפון
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          dir="ltr"
          defaultValue={business.phone ?? ''}
          className="input-base"
          placeholder="050-0000000"
        />
      </div>

      {/* Links */}
      <LinkFields defaults={business} />

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 h-12 rounded-xl brand-gradient text-white font-semibold text-sm disabled:opacity-60"
        >
          {isPending ? 'שומר...' : 'שמור שינויים'}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/${locale}/business/${business.id}`)}
          className="flex-1 h-12 rounded-xl border border-slate-200 bg-white text-allay-dark font-semibold text-sm hover:bg-slate-50"
        >
          חזרה לעמוד
        </button>
      </div>
    </form>
    </>
  );
}
