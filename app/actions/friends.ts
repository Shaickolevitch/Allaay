'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  sendFriendRequest,
  respondToRequest,
  removeFriend,
  setFriendCircles,
} from '@/lib/supabase/friends';

export async function sendFriendRequestAction(toId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  await sendFriendRequest(user.id, toId);
  revalidatePath('/he/search');
  revalidatePath('/he/friends');
}

export async function acceptRequestAction(friendshipId: string) {
  await respondToRequest(friendshipId, 'accepted');
  revalidatePath('/he/friends');
}

export async function declineRequestAction(friendshipId: string) {
  await respondToRequest(friendshipId, 'declined');
  revalidatePath('/he/friends');
}

export async function removeFriendAction(friendId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  await removeFriend(user.id, friendId);
  revalidatePath('/he/friends');
}

export async function setCirclesAction(friendId: string, circles: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  await setFriendCircles(user.id, friendId, circles);
  revalidatePath('/he/friends');
}

export async function updatePrivacyAction(maxSteps: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('users')
    .update({ privacy_max_steps: maxSteps })
    .eq('id', user.id);

  if (error) throw error;
  revalidatePath('/he/profile');
}
