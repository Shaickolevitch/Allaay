'use client';

import { useState, useTransition } from 'react';
import { toggleBridgeOptoutAction } from '@/app/actions/privacy';

export function BridgeOptoutToggle({
  friendId,
  isOptedOut: initialOptedOut,
}: {
  friendId: string;
  isOptedOut: boolean;
}) {
  const [optedOut, setOptedOut] = useState(initialOptedOut);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const next = !optedOut;
    setOptedOut(next); // optimistic
    startTransition(async () => {
      await toggleBridgeOptoutAction(friendId);
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      title={optedOut ? 'הסר הגבלה' : 'הסתר ממנו/ה בנתיבי המלצה'}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
        optedOut ? 'bg-red-400' : 'bg-slate-200'
      }`}
      role="switch"
      aria-checked={optedOut}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          optedOut ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}
