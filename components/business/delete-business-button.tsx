'use client';

import { useState, useTransition } from 'react';
import { deleteBusinessAction } from '@/app/actions/business';

export function DeleteBusinessButton({ businessId }: { businessId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteBusinessAction(businessId);
    });
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="w-full py-3 rounded-xl border border-red-200 text-red-500 font-semibold text-sm hover:bg-red-50 transition-colors"
      >
        🗑️ מחק עסק
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex flex-col gap-3">
      <p className="text-sm font-medium text-red-700 text-center">
        האם אתה בטוח? פעולה זו אינה ניתנת לביטול.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="flex-1 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-60"
        >
          ביטול
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60"
        >
          {isPending ? 'מוחק...' : 'כן, מחק'}
        </button>
      </div>
    </div>
  );
}
