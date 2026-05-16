import { type ClassValue, clsx } from 'clsx';

/**
 * Merge Tailwind classes safely.
 * (Using clsx for conditional classes — add tailwind-merge if collisions arise)
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Format an Israeli phone number for display */
export function formatPhone(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 10) {
    return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6)}`;
  }
  return phone;
}

/** Truncate text to n characters with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + '…';
}

/** Convert hops count to human-readable label (Hebrew) */
export function hopsLabel(hops: number): string {
  if (hops === 1) return 'חבר שלכם';
  if (hops === 2) return 'חבר של חבר';
  if (hops === 3) return '3 דרגות';
  return `${hops} דרגות`;
}

/** Check if a value is within 1–3 hops (Familiar tab) */
export function isFamiliar(hops: number): boolean {
  return hops >= 1 && hops <= 3;
}
