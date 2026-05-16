'use client';

import { useState, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sendPhoneOtpAction, verifyPhoneOtpAction } from '@/app/actions/phone';

type Step = 'phone' | 'name' | 'photo' | 'bio' | 'city';
const ALL_STEPS: Step[] = ['phone', 'name', 'photo', 'bio', 'city'];

interface OnboardingFlowProps {
  userId: string;
  locale: string;
  redirectTo: string;
  /** True for existing users whose profile is complete but phone isn't verified yet */
  phoneAlreadyVerified?: boolean;
  initialData: {
    name: string;
    profilePicUrl: string | null;
    bio: string;
    city: string;
  };
}

export default function OnboardingFlow({
  userId,
  locale,
  redirectTo,
  phoneAlreadyVerified = false,
  initialData,
}: OnboardingFlowProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();

  const STEPS: Step[] = ALL_STEPS;

  // Phone-only mode: existing user whose profile is complete but phone not yet verified.
  // Detected by: name is already set (profile was filled in before phone was mandatory).
  // These users see only the phone step and are redirected immediately after verification.
  const isPhoneOnlyMode = !phoneAlreadyVerified && !!initialData.name.trim();

  const [step, setStep] = useState(0);

  // Phone step state
  const [phoneRaw, setPhoneRaw] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Profile steps
  const [name, setName] = useState(initialData.name);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(initialData.profilePicUrl);
  const [bio, setBio] = useState(initialData.bio);
  const [city, setCity] = useState(initialData.city);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  const currentStep: Step = STEPS[step];
  const isLastStep = step === STEPS.length - 1;
  const progressPercent = ((step + 1) / STEPS.length) * 100;

  // ── Phone: send OTP ────────────────────────────────────────────────────────
  function handleSendOtp() {
    setError(null);
    startTransition(async () => {
      const result = await sendPhoneOtpAction(phoneRaw);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOtpSent(true);
      // 60-second resend cooldown
      setCooldown(60);
      const interval = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) { clearInterval(interval); return 0; }
          return c - 1;
        });
      }, 1000);
    });
  }

  // ── Phone: verify OTP ─────────────────────────────────────────────────────
  function handleVerifyOtp() {
    setError(null);
    startTransition(async () => {
      const result = await verifyPhoneOtpAction(phoneRaw, otp);
      if (result.error) {
        setError(result.error);
        return;
      }
      // Phone-only mode: phone verification is all we needed — go home
      if (isPhoneOnlyMode) {
        router.push(redirectTo);
        router.refresh();
        return;
      }
      setStep((s) => s + 1);
    });
  }

  // ── Photo upload ──────────────────────────────────────────────────────────
  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadPreview(URL.createObjectURL(file));
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `avatars/${userId}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('profile-pics')
      .upload(path, file, { upsert: true });
    if (!uploadError) {
      const { data } = supabase.storage.from('profile-pics').getPublicUrl(path);
      setProfilePicUrl(data.publicUrl);
    }
    setUploading(false);
  }

  // ── Step navigation ───────────────────────────────────────────────────────
  function validateStep(): boolean {
    if (currentStep === 'name' && !name.trim()) {
      setError('שם חובה');
      return false;
    }
    if (currentStep === 'city' && !city.trim()) {
      setError('עיר מגורים חובה');
      return false;
    }
    return true;
  }

  async function handleNext() {
    setError(null);
    if (!validateStep()) return;
    if (!isLastStep) {
      setStep((s) => s + 1);
      return;
    }
    await handleComplete();
  }

  function handleSkip() {
    setError(null);
    if (isLastStep) { handleComplete(); } else { setStep((s) => s + 1); }
  }

  async function handleComplete() {
    setSaving(true);
    const { error: saveError } = await supabase
      .from('users')
      .update({
        name: name.trim(),
        profile_pic_url: profilePicUrl,
        bio: bio.trim() || null,
        city: city.trim(),
        onboarding_complete: true,
      })
      .eq('id', userId);
    setSaving(false);
    if (saveError) { setError('שגיאה בשמירת הפרופיל. נסו שוב.'); return; }
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Progress bar — hidden in phone-only mode (single step) */}
      {!isPhoneOnlyMode && (
        <div className="w-full max-w-sm mb-8">
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full brand-gradient transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-center text-xs text-slate-400 mt-2">
            שלב {step + 1} מתוך {STEPS.length}
          </p>
        </div>
      )}

      {/* Card */}
      <div className="w-full max-w-sm">
        <div className="card space-y-6" dir="rtl">

          {/* ── Step: Phone ────────────────────────────────────────────────── */}
          {currentStep === 'phone' && (
            <>
              <div className="text-center">
                <div className="text-4xl mb-3">📱</div>
                <h2 className="text-xl font-bold text-slate-900">אמתו את מספר הטלפון שלכם</h2>
                <p className="text-slate-500 text-sm mt-1">
                  {isPhoneOnlyMode
                    ? 'נדרש אימות טלפון כדי להמשיך להשתמש ב-Allaay'
                    : 'זה עוזר לשמור על Allaay אמינה ובטוחה'}
                </p>
              </div>

              {!otpSent ? (
                /* ── Enter phone ── */
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="flex items-center px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-500 shrink-0">
                      🇮🇱 +972
                    </div>
                    <input
                      type="tel"
                      dir="ltr"
                      placeholder="050-0000000"
                      value={phoneRaw}
                      onChange={(e) => setPhoneRaw(e.target.value)}
                      className="input-base flex-1"
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    ניתן גם להזין מספר בינלאומי עם קידומת מדינה (למשל +1...)
                  </p>
                  <Button
                    fullWidth
                    size="lg"
                    onClick={handleSendOtp}
                    loading={isPending}
                    disabled={!phoneRaw.trim()}
                  >
                    שלחו קוד אימות
                  </Button>
                </div>
              ) : (
                /* ── Enter OTP ── */
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 text-center">
                    שלחנו קוד ב-SMS ל-{phoneRaw}
                  </p>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    dir="ltr"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="input-base text-center text-2xl tracking-[0.5em] font-bold"
                    autoFocus
                  />
                  <Button
                    fullWidth
                    size="lg"
                    onClick={handleVerifyOtp}
                    loading={isPending}
                    disabled={otp.length < 4}
                  >
                    אמתו קוד
                  </Button>
                  <div className="text-center">
                    {cooldown > 0 ? (
                      <p className="text-xs text-slate-400">
                        שליחה מחדש אפשרית בעוד {cooldown} שניות
                      </p>
                    ) : (
                      <button
                        onClick={() => { setOtp(''); setError(null); handleSendOtp(); }}
                        className="text-xs text-allay-blue hover:underline"
                      >
                        לא קיבלתם? שלחו שוב
                      </button>
                    )}
                    <button
                      onClick={() => { setOtpSent(false); setOtp(''); setError(null); }}
                      className="block mx-auto mt-1 text-xs text-slate-400 hover:text-slate-600"
                    >
                      שנו מספר
                    </button>
                  </div>
                </div>
              )}

              {/* Error for phone step */}
              {error && (
                <p className="text-center text-sm text-red-600">{error}</p>
              )}
            </>
          )}

          {/* ── Step: Name ─────────────────────────────────────────────────── */}
          {currentStep === 'name' && (
            <>
              <div className="text-center">
                <div className="text-4xl mb-3">👋</div>
                <h2 className="text-xl font-bold text-slate-900">ברוכים הבאים ל-Allay!</h2>
                <p className="text-slate-500 text-sm mt-1">מה שמך?</p>
              </div>
              <Input
                label="שם מלא"
                placeholder="למשל: דנה לוי"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(null); }}
                error={error ?? undefined}
                autoFocus
                autoComplete="name"
              />
            </>
          )}

          {/* ── Step: Photo ────────────────────────────────────────────────── */}
          {currentStep === 'photo' && (
            <>
              <div className="text-center">
                <div className="text-4xl mb-3">📸</div>
                <h2 className="text-xl font-bold text-slate-900">תמונת פרופיל</h2>
                <p className="text-slate-500 text-sm mt-1">
                  תמונה עוזרת לחברים לזהות אתכם (אופציונלי)
                </p>
              </div>
              <div className="flex flex-col items-center gap-4">
                <div className="size-28 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-md">
                  {(uploadPreview ?? profilePicUrl) ? (
                    <Image
                      src={uploadPreview ?? profilePicUrl!}
                      alt="תמונת פרופיל"
                      width={112} height={112}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <svg className="size-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/>
                      </svg>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                <Button variant="outline" onClick={() => fileRef.current?.click()} loading={uploading} size="sm">
                  {profilePicUrl ? 'שנו תמונה' : 'העלו תמונה'}
                </Button>
                <p className="text-xs text-slate-400 text-center">מומלץ: תמונה מרובעת, לפחות 200×200 פיקסלים</p>
              </div>
            </>
          )}

          {/* ── Step: Bio ──────────────────────────────────────────────────── */}
          {currentStep === 'bio' && (
            <>
              <div className="text-center">
                <div className="text-4xl mb-3">✍️</div>
                <h2 className="text-xl font-bold text-slate-900">ספרו על עצמכם</h2>
                <p className="text-slate-500 text-sm mt-1">כמה מילים — מי אתם, מה אתם אוהבים (אופציונלי)</p>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">ביוגרפיה קצרה</label>
                <textarea
                  className="input-base resize-none"
                  rows={4}
                  placeholder="כמה מילים עליכם..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 200))}
                  maxLength={200}
                />
                <p className="text-xs text-slate-400 text-end">{bio.length}/200 תווים</p>
              </div>
            </>
          )}

          {/* ── Step: City ─────────────────────────────────────────────────── */}
          {currentStep === 'city' && (
            <>
              <div className="text-center">
                <div className="text-4xl mb-3">🏙️</div>
                <h2 className="text-xl font-bold text-slate-900">באיזו עיר אתם?</h2>
                <p className="text-slate-500 text-sm mt-1">עוזר לנו להראות לכם עסקים קרובים</p>
              </div>
              <Input
                label="עיר מגורים"
                placeholder="למשל: תל אביב"
                value={city}
                onChange={(e) => { setCity(e.target.value); setError(null); }}
                error={error ?? undefined}
                autoFocus
              />
            </>
          )}

          {/* Global error (non-phone steps) */}
          {error && currentStep !== 'phone' && (
            <p className="text-center text-sm text-red-600">{error}</p>
          )}

          {/* Actions — phone step has its own buttons above */}
          {currentStep !== 'phone' && (
            <div className="space-y-2">
              <Button fullWidth size="lg" onClick={handleNext} loading={saving}>
                {isLastStep ? 'סיימנו! בואו נתחיל 🎉' : 'המשך'}
              </Button>
              {(currentStep === 'photo' || currentStep === 'bio') && (
                <Button variant="ghost" fullWidth onClick={handleSkip} disabled={saving || uploading}>
                  דלג
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Back — not allowed on phone step or phone-only mode */}
        {step > 1 && !isPhoneOnlyMode && (
          <button
            onClick={() => { setError(null); setStep((s) => s - 1); }}
            className="mt-4 mx-auto block text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            ← חזרה
          </button>
        )}
      </div>
    </div>
  );
}
