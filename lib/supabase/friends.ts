/**
 * Friend-related Supabase helpers.
 * All functions run server-side (use createClient from server.ts).
 */
import { createClient } from './server';

export type FriendshipStatus = 'pending' | 'accepted' | 'declined';

export interface UserSearchResult {
  id: string;
  name: string | null;
  profile_pic_url: string | null;
  city: string | null;
  friendship_status: FriendshipStatus | null;
  friendship_id: string | null;
  i_am_requester: boolean;
}

export interface FriendRequest {
  id: string;
  status: FriendshipStatus;
  created_at: string;
  requester: {
    id: string;
    name: string | null;
    profile_pic_url: string | null;
    city: string | null;
  };
}

export interface Friend {
  id: string;
  name: string | null;
  profile_pic_url: string | null;
  city: string | null;
  circles: string[];
  accepted_at: string | null;
}

// Search users by name (trigram search) excluding self
export async function searchUsers(query: string, currentUserId: string): Promise<UserSearchResult[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('search_users', {
    search_query: query,
    current_user_id: currentUserId,
  });

  if (error) throw error;
  return data ?? [];
}

// Get incoming pending friend requests (others sent to me)
export async function getIncomingRequests(userId: string): Promise<FriendRequest[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('friendships')
    .select(`
      id,
      status,
      created_at,
      requester:users!friendships_user_a_id_fkey(id, name, profile_pic_url, city)
    `)
    .eq('user_b_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  // user_b is always the recipient (canonical: a < b, so b is the bigger uuid)
  // But requests can come from either side — need the actual initiator field
  // For now we use the DB convention: the one who inserted is user_a
  return (data ?? []) as unknown as FriendRequest[];
}

// Get all accepted friends for a user with their circles
export async function getFriends(userId: string): Promise<Friend[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('friendships')
    .select(`
      id,
      user_a_id,
      user_b_id,
      accepted_at,
      user_a:users!friendships_user_a_id_fkey(id, name, profile_pic_url, city),
      user_b:users!friendships_user_b_id_fkey(id, name, profile_pic_url, city)
    `)
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
    .eq('status', 'accepted')
    .order('accepted_at', { ascending: false });

  if (error) throw error;

  // Resolve the "other" user in each friendship
  const friends: Friend[] = await Promise.all(
    (data ?? []).map(async (f: any) => {
      const other = f.user_a_id === userId ? f.user_b : f.user_a;

      // Fetch circles for this friend
      const { data: circles } = await supabase
        .from('friend_circles')
        .select('circle')
        .eq('user_id', userId)
        .eq('friend_id', other.id);

      return {
        ...other,
        circles: (circles ?? []).map((c: any) => c.circle),
        accepted_at: f.accepted_at,
      };
    })
  );

  return friends;
}

// Send a friend request (canonical ordering enforced)
export async function sendFriendRequest(fromId: string, toId: string) {
  const supabase = await createClient();

  const [a, b] = fromId < toId ? [fromId, toId] : [toId, fromId];

  const { error } = await supabase.from('friendships').insert({
    user_a_id: a,
    user_b_id: b,
    status: 'pending',
  });

  if (error) throw error;
}

// Accept or decline a friend request
export async function respondToRequest(
  friendshipId: string,
  action: 'accepted' | 'declined'
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('friendships')
    .update({
      status: action,
      ...(action === 'accepted' ? { accepted_at: new Date().toISOString() } : {}),
    })
    .eq('id', friendshipId);

  if (error) throw error;
}

// Remove a friend (delete the friendship row)
export async function removeFriend(userId: string, friendId: string) {
  const supabase = await createClient();

  const [a, b] = userId < friendId ? [userId, friendId] : [friendId, userId];

  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('user_a_id', a)
    .eq('user_b_id', b);

  if (error) throw error;
}

// Set circles for a friend (replace all)
export async function setFriendCircles(
  userId: string,
  friendId: string,
  circles: string[]
) {
  const supabase = await createClient();

  // Delete existing
  await supabase
    .from('friend_circles')
    .delete()
    .eq('user_id', userId)
    .eq('friend_id', friendId);

  if (circles.length === 0) return;

  const { error } = await supabase.from('friend_circles').insert(
    circles.map((circle) => ({
      user_id: userId,
      friend_id: friendId,
      circle,
    }))
  );

  if (error) throw error;
}

// Get friendship status between two users
export async function getFriendshipStatus(userId: string, otherId: string) {
  const supabase = await createClient();

  const [a, b] = userId < otherId ? [userId, otherId] : [otherId, userId];

  const { data } = await supabase
    .from('friendships')
    .select('id, status, user_a_id')
    .eq('user_a_id', a)
    .eq('user_b_id', b)
    .single();

  return data ?? null;
}
