'use client';

import { useState, useTransition } from 'react';
import { updatePrivacyAction } from '@/app/actions/friends';

const STEPS = [
  { value: 1, label: 'רק אני', description: 'רק אתה רואה את ההמלצות שלך' },
  { value: 2, label: 'חברים', description: 'רק חברים ישירים' },
  { value: 3, label: 'חברים של חברים', description: 'עד 2 קשרים' },
  { value: 4, label: 'עד 4 קשרים', description: 'מעגל חברתי רחב' },
  { value: 5, label: 'עד 5 קשרים', description: 'כמעט כולם' },
  { value: 6, label: 'כולם', description: 'כל משתמשי Allay (ברירת מחדל)' },
];

export function PrivacySettings({ currentMaxSteps }: { currentMaxSteps: number }) {
  const [value, setValue] = useState(currentMaxSteps);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    startTransition(async () => {
      await updatePrivacyAction(value);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  return (
    <div className="card">
      <h2 className="font-bold text-allay-dark mb-1">פרטיות</h2>
      <p className="text-sm text-allay-muted mb-4">
        מי יכול לראות שאתה ממליץ על עסק?
      </p>

      <div className="flex flex-col gap-2 mb-4">
        {STEPS.map((step) => (
          <label
            key={step.value}
            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
              value === step.value
                ? 'border-allay-blue bg-allay-blue/5'
                : 'border-gray-100 hover:border-gray-200'
            }`}
          >
            <input
              type="radio"
              name="privacy"
              value={step.value}
              checked={value === step.value}
              onChange={() => setValue(step.value)}
              className="accent-allay-blue"
            />
            <div>
              <p className="text-sm font-medium text-allay-dark">{step.label}</p>
              <p className="text-xs text-allay-muted">{step.description}</p>
            </div>
          </label>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={isPending || value === currentMaxSteps}
        className="w-full py-2.5 rounded-xl bg-allay-blue text-white font-medium text-sm hover:bg-allay-indigo transition-colors disabled:opacity-60"
      >
        {saved ? '✓ נשמר' : isPending ? 'שומר...' : 'שמור הגדרות'}
      </button>
    </div>
  );
}
