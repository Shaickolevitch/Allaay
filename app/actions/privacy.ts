'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/**
 * Toggle bridge opt-out: if it exists → delete it, otherwise → insert it.
 * user_id = current user (they're opting out)
 * excluded_viewer_id = the friend who should NOT see them in trust paths
 */
export async function toggleBridgeOptoutAction(excludedViewerId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Check if opt-out already exists
  const { data: existing } = await supabase
    .from('bridge_optouts')
    .select('id')
    .eq('user_id', user.id)
    .eq('excluded_viewer_id', excludedViewerId)
    .single();

  if (existing) {
    await supabase.from('bridge_optouts').delete().eq('id', existing.id);
  } else {
    await supabase.from('bridge_optouts').insert({
      user_id: user.id,
      excluded_viewer_id: excludedViewerId,
    });
  }

  revalidatePath('/he/settings/privacy');
}

/**
 * Returns the IDs of friends the current user has opted out from
 * (i.e., friends who cannot see this user in trust paths).
 */
export async function getMyOptedOutViewers(): Promise<string[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('bridge_optouts')
    .select('excluded_viewer_id')
    .eq('user_id', user.id);

  return (data ?? []).map((r: any) => r.excluded_viewer_id);
}
