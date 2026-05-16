'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

// Mark specific notifications as read
export async function markNotificationsReadAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const raw = formData.get('ids') as string;
  let ids: string[] = [];
  try {
    ids = JSON.parse(raw);
  } catch {
    return;
  }

  if (!ids.length) return;

  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', user.id)
    .in('id', ids);

  revalidatePath('/he/notifications');
}

// Mark a single notification as read
export async function markOneReadAction(notificationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .eq('user_id', user.id);

  revalidatePath('/he/notifications');
}
