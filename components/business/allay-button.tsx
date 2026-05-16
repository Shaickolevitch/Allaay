'use client';

import { useState, useTransition, useCallback } from 'react';
import { allayBusinessAction, removeAllayAction, submitScoreAction, submitCommentAction } from '@/app/actions/business';
import { Toast } from '@/components/ui/toast';
import clsx from 'clsx';

const SCORE_LABELS: Record<string, string> = {
  professionalism: 'מקצועיות',
  initiative: 'יוזמה',
  speed: 'מהירות',
  communication: 'תקשורת',
  quality: 'איכות',
};

const SCORE_KEYS = ['professionalism', 'initiative', 'speed', 'communication', 'quality'] as const;

interface AllayButtonProps {
  businessId: string;
  allayId: string | null;       // null = not yet allayed
  existingScore: Record<string, number> | null;
  existingComment: string | null;
  isOwner?: boolean;            // owner can't allay their own business
}

export function AllayButton({ businessId, allayId, existingScore, existingComment, isOwner = false }: AllayButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>(
    existingScore ?? { professionalism: 0, initiative: 0, speed: 0, communication: 0, quality: 0 }
  );
  const [comment, setComment] = useState(existingComment ?? '');
  const [saved, setSaved] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const hideToast = useCallback(() => setShowToast(false), []);

  const hasAllayed = allayId !== null;

  const handleAllay = () => {
    startTransition(async () => {
      await allayBusinessAction(businessId);
    });
  };

  const handleRemoveAllay = () => {
    if (!confirm('להסיר את ה-Allay שלך? הציון וההערה ימחקו גם כן.')) return;
    startTransition(async () => {
      await removeAllayAction(businessId);
    });
  };

  const handleSaveScore = () => {
    if (!allayId) return;
    const allScored = SCORE_KEYS.every((k) => scores[k] > 0);
    startTransition(async () => {
      if (allScored) {
        await submitScoreAction(businessId, allayId, scores as any);
      }
      if (comment.trim()) {
        await submitCommentAction(businessId, allayId, comment);
      }
      setSaved(true);
      setShowToast(true);
      setTimeout(() => { setSaved(false); setShowForm(false); }, 1500);
    });
  };

  // Owners see a neutral label instead of the allay button
  if (isOwner) {
    return (
      <div className="w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 font-medium text-sm text-center">
        זה העסק שלך
      </div>
    );
  }

  if (!hasAllayed) {
    return (
      <button
        onClick={handleAllay}
        disabled={isPending}
        className="w-full py-3 rounded-xl brand-gradient text-white font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
      >
        <span className="text-xl">✦</span>
        {isPending ? 'מעבד...' : 'Allay — אני ממליץ!'}
      </button>
    );
  }

  return (
    <>
    <Toast message="הדירוג נשמר בהצלחה" show={showToast} onHide={hideToast} />
    <div className="flex flex-col gap-3">
      {/* Allayed state */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 py-2.5 px-4 rounded-xl bg-green-50 border border-green-200 text-green-700 font-medium text-sm">
          <span>✦</span> את/ה ממליץ/ה על העסק הזה
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="py-2.5 px-4 rounded-xl border border-gray-200 text-sm font-medium text-allay-dark hover:bg-gray-50 transition-colors"
        >
          {existingScore ? 'ערוך ציון' : 'הוסף ציון'}
        </button>
      </div>

      {/* Score + comment form */}      {showForm && (
        <div className="card flex flex-col gap-4">
          <h3 className="font-bold text-allay-dark text-sm">דרג את העסק</h3>

          {SCORE_KEYS.map((key) => (
            <div key={key}>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium text-allay-muted">
                  {SCORE_LABELS[key]}
                </span>
                <span className="text-xs text-allay-muted">
                  {scores[key] > 0 ? `${scores[key]}/5` : '—'}
                </span>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setScores((s) => ({ ...s, [key]: star }))}
                    className={clsx(
                      'flex-1 h-9 rounded-lg text-lg transition-colors',
                      scores[key] >= star
                        ? 'text-yellow-400 bg-yellow-50'
                        : 'text-gray-200 hover:text-yellow-200 bg-gray-50'
                    )}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div>
            <label className="text-xs font-medium text-allay-muted mb-1 block">
              הוסף הערה (אופציונלי)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 500))}
              rows={3}
              placeholder="ספר על החוויה שלך..."
              className="input-base w-full resize-none text-sm"
            />
            <p className="text-xs text-allay-muted text-end mt-0.5">{comment.length}/500</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSaveScore}
              disabled={isPending}
              className="flex-1 py-2.5 rounded-xl bg-allay-blue text-white font-medium text-sm hover:bg-allay-indigo transition-colors disabled:opacity-60"
            >
              {saved ? '✓ נשמר' : isPending ? 'שומר...' : 'שמור'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="py-2.5 px-4 rounded-xl border border-gray-200 text-sm text-allay-muted hover:bg-gray-50 transition-colors"
            >
              ביטול
            </button>
          </div>

          <button
            onClick={handleRemoveAllay}
            className="text-xs text-red-400 hover:text-red-600 text-center transition-colors"
          >
            הסר Allay
          </button>
        </div>
      )}
    </div>
    </>
  );
}
