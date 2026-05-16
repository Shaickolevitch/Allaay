'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { createBusinessAction } from '@/app/actions/business';
import { LinkFields } from './link-fields';

interface Category {
  id: string;
  name_he: string;
  emoji: string;
}

export function BusinessCreateForm({
  categories,
  locale,
}: {
  categories: Category[];
  locale: string;
}) {
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      await createBusinessAction(formData);
    } catch (err: any) {
      setError(err?.message ?? 'שגיאה. נסה שוב.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" dir="rtl">
      {/* Cover photo picker */}
      <div>
        <label className="text-xs font-medium text-allay-muted mb-2 block">
          תמונת כיסוי
        </label>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative w-full h-36 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden hover:border-allay-blue/50 transition-colors"
        >
          {coverPreview ? (
            <Image src={coverPreview} alt="preview" fill className="object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-allay-muted">
              <span className="text-3xl">📷</span>
              <span className="text-xs">לחץ להוספת תמונה</span>
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
      <div>
        <label className="text-xs font-medium text-allay-muted mb-1 block">
          שם העסק <span className="text-red-400">*</span>
        </label>
        <input
          name="name"
          type="text"
          required
          placeholder="לדוגמה: שרברב מושיקו"
          className="input-base w-full"
        />
      </div>

      {/* Category */}
      <div>
        <label className="text-xs font-medium text-allay-muted mb-1 block">
          קטגוריה <span className="text-red-400">*</span>
        </label>
        <select name="category_id" required className="input-base w-full">
          <option value="">בחר קטגוריה...</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.name_he}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="text-xs font-medium text-allay-muted mb-1 block">
          תיאור קצר (אופציונלי)
        </label>
        <textarea
          name="description"
          rows={3}
          maxLength={600}
          placeholder="מה מייחד את העסק הזה?"
          className="input-base w-full resize-none"
        />
      </div>

      {/* City */}
      <div>
        <label className="text-xs font-medium text-allay-muted mb-1 block">עיר</label>
        <input name="city" type="text" placeholder="תל אביב" className="input-base w-full" />
      </div>

      {/* Phone */}
      <div>
        <label className="text-xs font-medium text-allay-muted mb-1 block">טלפון</label>
        <input
          name="phone"
          type="tel"
          placeholder="050-0000000"
          className="input-base w-full"
          dir="ltr"
        />
      </div>

      {/* Links (at least one required) */}
      <LinkFields />

      {error && (
        <p className="text-sm text-red-600 text-center bg-red-50 rounded-xl p-3">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 rounded-xl brand-gradient text-white font-semibold text-sm mt-2 hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? 'שומר...' : 'צור עמוד עסק'}
      </button>
    </form>
  );
}
