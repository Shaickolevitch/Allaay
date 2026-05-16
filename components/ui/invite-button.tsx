'use client';

import { useState } from 'react';

interface InviteButtonProps {
  className?: string;
}

export function InviteButton({ className }: InviteButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const shareData = {
      title: 'הצטרפו אליי ב-Allay ✦',
      text: 'Allay — רשת המלצות מבוססת אמון. מצאו עסקים שממליצים עליהם חברים של חברים שלכם.',
      url: 'https://allaay.vercel.app',
    };

    // Native share sheet (mobile / supported desktop)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled — do nothing
        return;
      }
    }

    // Fallback: copy link to clipboard
    try {
      await navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available — do nothing
    }
  }

  return (
    <button
      onClick={handleShare}
      className={className}
      type="button"
    >
      <span className="text-xl">👥</span>
      <p className="text-xs font-semibold text-allay-blue">
        {copied ? '✓ הקישור הועתק!' : 'הזמינו חברים →'}
      </p>
    </button>
  );
}
