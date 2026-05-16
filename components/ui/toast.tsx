'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  show: boolean;
  onHide: () => void;
}

/**
 * A lightweight bottom-center toast that auto-dismisses after 2.5 s.
 * Renders above the bottom nav (bottom-24 = 6rem).
 */
export function Toast({ message, show, onHide }: ToastProps) {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(onHide, 2500);
    return () => clearTimeout(timer);
  }, [show, onHide]);

  return (
    <div
      aria-live="polite"
      className={`fixed bottom-24 inset-x-0 flex justify-center z-50 pointer-events-none transition-all duration-300 ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      }`}
    >
      <div className="bg-slate-900 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-xl flex items-center gap-2">
        <span className="text-green-400">✓</span>
        {message}
      </div>
    </div>
  );
}
