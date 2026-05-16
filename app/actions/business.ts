'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/** Ensures a URL string has a protocol prefix. Returns null for empty values. */
function normalizeUrl(raw: string | null | undefined): string | null {
  const v = raw?.trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  return `https://${v}`;
}

// ─── Create a new business page ───────────────────────────────
export async function createBusinessAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const name = (formData.get('name') as string).trim();
  const description = (formData.get('description') as string | null)?.trim() || null;
  const category_id = formData.get('category_id') as string;
  const city = (formData.get('city') as string | null)?.trim() || null;
  const phone = (formData.get('phone') as string | null)?.trim() || null;
  const website = normalizeUrl(formData.get('website') as string | null);
  const facebook_url = normalizeUrl(formData.get('facebook_url') as string | null);
  const instagram_url = normalizeUrl(formData.get('instagram_url') as string | null);
  const tiktok_url = normalizeUrl(formData.get('tiktok_url') as string | null);
  const linkedin_url = normalizeUrl(formData.get('linkedin_url') as string | null);

  if (!name || !category_id) throw new Error('שדות חובה חסרים');

  const hasLink = website || facebook_url || instagram_url || tiktok_url || linkedin_url;
  if (!hasLink) throw new Error('יש למלא לפחות קישור אחד לעסק');

  const { data, error } = await supabase
    .from('business_pages')
    .insert({ owner_id: user.id, name, description, category_id, city, phone, website, facebook_url, instagram_url, tiktok_url, linkedin_url })
    .select('id')
    .single();

  if (error) throw error;

  // Upload cover photo if provided
  const coverFile = formData.get('cover_photo') as File | null;
  if (coverFile && coverFile.size > 0) {
    const ext = coverFile.name.split('.').pop() ?? 'jpg';
    const path = `${data.id}/cover.${ext}`;
    const { data: uploaded } = await supabase.storage
      .from('business-photos')
      .upload(path, coverFile, { upsert: true, contentType: coverFile.type });
    if (uploaded) {
      const { data: { publicUrl } } = supabase.storage
        .from('business-photos')
        .getPublicUrl(path);
      await supabase
        .from('business_pages')
        .update({ cover_url: publicUrl })
        .eq('id', data.id);
    }
  }

  // Auto-allay own business
  await supabase.from('allays').insert({ user_id: user.id, business_id: data.id });

  revalidatePath('/he/home');
  redirect(`/he/business/${data.id}`);
}

// ─── Allay a business ─────────────────────────────────────────
export async function allayBusinessAction(businessId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('allays')
    .insert({ user_id: user.id, business_id: businessId });

  if (error && error.code !== '23505') throw error; // ignore duplicate
  revalidatePath(`/he/business/${businessId}`);
  revalidatePath('/he/home');
}

// ─── Remove allay ─────────────────────────────────────────────
export async function removeAllayAction(businessId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  await supabase
    .from('allays')
    .delete()
    .eq('user_id', user.id)
    .eq('business_id', businessId);

  revalidatePath(`/he/business/${businessId}`);
  revalidatePath('/he/home');
}

// ─── Submit score ─────────────────────────────────────────────
export async function submitScoreAction(
  businessId: string,
  allayId: string,
  scores: {
    professionalism: number;
    initiative: number;
    speed: number;
    communication: number;
    quality: number;
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('scores').upsert({
    user_id: user.id,
    business_id: businessId,
    allay_id: allayId,
    ...scores,
  }, { onConflict: 'user_id,business_id' });

  if (error) throw error;
  revalidatePath(`/he/business/${businessId}`);
}

// ─── Update business (owner only) ────────────────────────────
export async function updateBusinessAction(
  businessId: string,
  formData: FormData
): Promise<{ error: string } | undefined> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'לא מחובר' };

  // Verify ownership
  const { data: biz } = await supabase
    .from('business_pages')
    .select('owner_id')
    .eq('id', businessId)
    .single();

  if (!biz || biz.owner_id !== user.id) return { error: 'אין הרשאה' };

  const name = (formData.get('name') as string).trim();
  const description = (formData.get('description') as string | null)?.trim() || null;
  const category_id = (formData.get('category_id') as string) || null;
  const city = (formData.get('city') as string | null)?.trim() || null;
  const phone = (formData.get('phone') as string | null)?.trim() || null;
  const website = normalizeUrl(formData.get('website') as string | null);
  const facebook_url = normalizeUrl(formData.get('facebook_url') as string | null);
  const instagram_url = normalizeUrl(formData.get('instagram_url') as string | null);
  const tiktok_url = normalizeUrl(formData.get('tiktok_url') as string | null);
  const linkedin_url = normalizeUrl(formData.get('linkedin_url') as string | null);

  if (!name) return { error: 'שם העסק הוא שדה חובה' };

  const hasLink = website || facebook_url || instagram_url || tiktok_url || linkedin_url;
  if (!hasLink) return { error: 'יש למלא לפחות קישור אחד לעסק' };

  // Upload new cover photo if provided
  let cover_url: string | undefined;
  const coverFile = formData.get('cover_photo') as File | null;
  if (coverFile && coverFile.size > 0) {
    const ext = coverFile.name.split('.').pop() ?? 'jpg';
    const path = `${businessId}/cover.${ext}`;
    const { data: uploaded } = await supabase.storage
      .from('business-photos')
      .upload(path, coverFile, { upsert: true, contentType: coverFile.type });
    if (uploaded) {
      const { data: { publicUrl } } = supabase.storage
        .from('business-photos')
        .getPublicUrl(path);
      cover_url = publicUrl;
    }
  }

  const updatePayload: Record<string, unknown> = { name, description, category_id, city, phone, website, facebook_url, instagram_url, tiktok_url, linkedin_url };
  if (cover_url) updatePayload.cover_url = cover_url;

  const { error } = await supabase
    .from('business_pages')
    .update(updatePayload)
    .eq('id', businessId);

  if (error) return { error: error.message };

  revalidatePath(`/he/business/${businessId}`);
  revalidatePath('/he/discover');
  revalidatePath('/he/home');
}

// ─── Submit comment ───────────────────────────────────────────
export async function submitCommentAction(
  businessId: string,
  allayId: string,
  body: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('comments').upsert({
    user_id: user.id,
    business_id: businessId,
    allay_id: allayId,
    body: body.trim(),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,business_id' });

  if (error) throw error;
  revalidatePath(`/he/business/${businessId}`);
}

// ─── Delete business (owner only) ────────────────────────────
export async function deleteBusinessAction(businessId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Verify ownership
  const { data: biz } = await supabase
    .from('business_pages')
    .select('owner_id')
    .eq('id', businessId)
    .single();

  if (!biz || biz.owner_id !== user.id) throw new Error('אין הרשאה');

  const { error } = await supabase
    .from('business_pages')
    .delete()
    .eq('id', businessId)
    .eq('owner_id', user.id); // double-guard

  if (error) throw new Error(error.message);

  revalidatePath('/he/discover');
  revalidatePath('/he/home');
  revalidatePath('/he/my-allays');
  redirect('/he/discover');
}
