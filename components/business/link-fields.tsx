'use client';

// Shared collapsible social/web link fields for create + edit forms.
// – Starts EXPANDED if any default values exist (edit flow).
// – Starts COLLAPSED if no defaults (create flow — less intimidating).
// – Inputs are always in the DOM (just visually hidden) so form submission
//   always captures their values, even when collapsed.
// – The server actions normalize values: auto-prepend https:// if needed.

import { useState } from 'react';

interface LinkFieldsProps {
  defaults?: {
    website?: string | null;
    facebook_url?: string | null;
    instagram_url?: string | null;
    tiktok_url?: string | null;
    linkedin_url?: string | null;
  };
}

const links = [
  {
    name: 'website',
    label: 'אתר אינטרנט',
    placeholder: 'my-business.co.il',
    icon: '🌐',
  },
  {
    name: 'facebook_url',
    label: 'Facebook',
    placeholder: 'facebook.com/mybusiness',
    icon: '📘',
  },
  {
    name: 'instagram_url',
    label: 'Instagram',
    placeholder: 'instagram.com/mybusiness',
    icon: '📸',
  },
  {
    name: 'tiktok_url',
    label: 'TikTok',
    placeholder: 'tiktok.com/@mybusiness',
    icon: '🎵',
  },
  {
    name: 'linkedin_url',
    label: 'LinkedIn',
    placeholder: 'linkedin.com/company/mybusiness',
    icon: '💼',
  },
];

export function LinkFields({ defaults = {} }: LinkFieldsProps) {
  const hasDefaults = Object.values(defaults).some(Boolean);
  const [open, setOpen] = useState(hasDefaults);

  return (
    <div className="flex flex-col gap-1">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full py-1.5 text-sm font-medium text-allay-dark"
      >
        <span className="flex items-center gap-1.5">
          🔗 קישורים ורשתות חברתיות
          <span className="text-xs text-allay-muted font-normal">(לפחות אחד חובה)</span>
        </span>
        <span
          className={`text-allay-muted text-[10px] transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        >
          ▼
        </span>
      </button>

      {/* Input list — always in DOM, visually hidden when collapsed */}
      <div className={`flex flex-col gap-2 mt-0.5 ${open ? '' : 'hidden'}`}>
        {links.map(({ name, label, placeholder, icon }) => (
          <div key={name} className="flex items-center gap-2">
            <span className="text-lg w-7 text-center shrink-0" title={label}>
              {icon}
            </span>
            <input
              name={name}
              type="text"
              placeholder={placeholder}
              defaultValue={(defaults as any)[name] ?? ''}
              className="input-base flex-1"
              dir="ltr"
            />
          </div>
        ))}
        <p className="text-xs text-allay-muted">
          ניתן להזין כתובת עם או בלי https://
        </p>
      </div>

      {!open && (
        <p className="text-xs text-allay-muted cursor-pointer" onClick={() => setOpen(true)}>
          לחץ להוספת קישורים
        </p>
      )}
    </div>
  );
}
