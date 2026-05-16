'use server';

import { createClient } from '@/lib/supabase/server';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Normalize an Israeli (or international) phone number to E.164 format. */
function normalizePhone(raw: string): string | null {
  const cleaned = raw.replace(/[\s\-().]/g, '');

  // Already E.164
  if (/^\+\d{10,15}$/.test(cleaned)) return cleaned;

  // Israeli 0xx-xxxxxxx  →  +972xxxxxxxxx
  if (/^0\d{8,9}$/.test(cleaned)) return '+972' + cleaned.slice(1);

  // 9-digit without leading 0 (e.g. 502042507)
  if (/^\d{9}$/.test(cleaned)) return '+972' + cleaned;

  return null;
}

// ─── Send OTP ─────────────────────────────────────────────────────────────────
export async function sendPhoneOtpAction(
  rawPhone: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'לא מחובר' };

  const phone = normalizePhone(rawPhone);
  if (!phone) return { error: 'מספר טלפון לא תקין' };

  // Block if another account already uses this number
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('phone', phone)
    .neq('id', user.id)
    .maybeSingle();

  if (existing) return { error: 'מספר הטלפון כבר רשום בחשבון אחר' };

  // Store the number (unverified) for reference
  await supabase.from('users').update({ phone, phone_verified: false }).eq('id', user.id);

  // Trigger OTP via Supabase Auth (uses configured SMS provider)
  const { error } = await supabase.auth.updateUser({ phone });

  if (error) {
    console.error('[sendPhoneOtp] Supabase error:', error.message);
    return { error: 'שגיאה בשליחת הקוד. בדקו את המספר ונסו שוב.' };
  }

  return {};
}

// ─── Verify OTP ───────────────────────────────────────────────────────────────
export async function verifyPhoneOtpAction(
  rawPhone: string,
  code: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'לא מחובר' };

  const phone = normalizePhone(rawPhone);
  if (!phone) return { error: 'מספר טלפון לא תקין' };

  const { error } = await supabase.auth.verifyOtp({
    phone,
    token: code,
    type: 'phone_change',
  });

  if (error) {
    console.error('[verifyPhoneOtp] Supabase error:', error.message);
    const msg = error.message?.toLowerCase() ?? '';
    if (msg.includes('expired') || msg.includes('token')) {
      return { error: 'הקוד פג תוקף. לחצו "שנו מספר" ושלחו קוד חדש.' };
    }
    return { error: 'קוד שגוי. נסו שוב.' };
  }

  // Mark verified in our users table
  await supabase
    .from('users')
    .update({ phone, phone_verified: true })
    .eq('id', user.id);

  return {};
}
