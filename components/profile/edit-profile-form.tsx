'use client';

import { useState, useTransition, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Avatar } from '@/components/ui/avatar';
import { Toast } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';

interface Profile {
  id: string;
  name: string | null;
  bio: string | null;
  city: string | null;
  profile_pic_url: string | null;
}

export function EditProfileForm({ profile }: { profile: Profile }) {
  const [name, setName] = useState(profile.name ?? '');
  const [bio, setBio] = useState(profile.bio ?? '');
  const [city, setCity] = useState(profile.city ?? '');
  const [picUrl, setPicUrl] = useState(profile.profile_pic_url);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const hideToast = useCallback(() => setShowToast(false), []);

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split('.').pop();
    const path = `${profile.id}/avatar.${ext}`;
    const { error } = await supabase.storage
      .from('profile-pics')
      .upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from('profile-pics').getPublicUrl(path);
      setPicUrl(data.publicUrl + `?t=${Date.now()}`);
      await supabase
        .from('users')
        .update({ profile_pic_url: data.publicUrl })
        .eq('id', profile.id);
    }
    setUploading(false);
  };

  const handleSave = () => {
    startTransition(async () => {
      const supabase = createClient();
      await supabase
        .from('users')
        .update({ name: name.trim(), bio: bio.trim(), city: city.trim() })
        .eq('id', profile.id);
      setSaved(true);
      setShowToast(true);
      setTimeout(() => { setSaved(false); router.refresh(); }, 1500);
    });
  };

  return (
    <>
    <Toast message="הפרופיל עודכן בהצלחה" show={showToast} onHide={hideToast} />
    <div className="card flex flex-col gap-4">
      <h2 className="font-bold text-allay-dark">עריכת פרופיל</h2>

      {/* Photo */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => fileRef.current?.click()}
          className="relative group"
          disabled={uploading}
        >
          <Avatar src={picUrl} name={name} size={72} />
          <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-xs font-medium">
              {uploading ? '...' : 'שנה'}
            </span>
          </div>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhoto}
        />
        <p className="text-xs text-allay-muted">לחץ לשינוי תמונה</p>
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-3">
        <div>
          <label className="text-xs font-medium text-allay-muted mb-1 block">שם</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-base w-full"
            placeholder="השם שלך"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-allay-muted mb-1 block">
            קצת עליכם
            <span className="ms-1 text-xs text-allay-muted/70">
              ({bio.length}/200)
            </span>
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 200))}
            className="input-base w-full resize-none"
            rows={3}
            placeholder="ספר קצת על עצמך..."
          />
        </div>
        <div>
          <label className="text-xs font-medium text-allay-muted mb-1 block">עיר</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="input-base w-full"
            placeholder="תל אביב"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={isPending || !name.trim()}
        className="w-full py-2.5 rounded-xl bg-allay-blue text-white font-medium text-sm hover:bg-allay-indigo transition-colors disabled:opacity-60"
      >
        {saved ? '✓ נשמר' : isPending ? 'שומר...' : 'שמור שינויים'}
      </button>
    </div>
    </>
  );
}
