/**
 * Supabase database types — generated from schema.
 * Run `supabase gen types typescript --project-id YOUR_PROJECT_REF > lib/supabase/database.types.ts`
 * to regenerate after schema changes.
 *
 * For now this is a placeholder that gives us type safety on the tables we build.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          phone: string | null;
          name: string | null;
          profile_pic_url: string | null;
          bio: string | null;
          city: string | null;
          privacy_max_steps: number;
          oauth_provider: string | null;
          onboarding_complete: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          phone?: string | null;
          name?: string | null;
          profile_pic_url?: string | null;
          bio?: string | null;
          city?: string | null;
          privacy_max_steps?: number;
          oauth_provider?: string | null;
          onboarding_complete?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          phone?: string | null;
          name?: string | null;
          profile_pic_url?: string | null;
          bio?: string | null;
          city?: string | null;
          privacy_max_steps?: number;
          oauth_provider?: string | null;
          onboarding_complete?: boolean;
          created_at?: string;
        };
      };
      friendships: {
        Row: {
          id: string;
          user_a_id: string;
          user_b_id: string;
          status: 'pending' | 'accepted' | 'declined';
          created_at: string;
          accepted_at: string | null;
        };
        Insert: {
          id?: string;
          user_a_id: string;
          user_b_id: string;
          status?: 'pending' | 'accepted' | 'declined';
          created_at?: string;
          accepted_at?: string | null;
        };
        Update: {
          id?: string;
          user_a_id?: string;
          user_b_id?: string;
          status?: 'pending' | 'accepted' | 'declined';
          created_at?: string;
          accepted_at?: string | null;
        };
      };
      business_pages: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          slug: string;
          description: string | null;
          category_id: string | null;
          branch_of_id: string | null;
          profile_pic_url: string | null;
          phone: string | null;
          whatsapp: string | null;
          website: string | null;
          social_links: Json | null;
          address: string | null;
          latitude: number | null;
          longitude: number | null;
          opening_hours: Json | null;
          price_range: string | null;
          subscription_tier: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          slug: string;
          description?: string | null;
          category_id?: string | null;
          branch_of_id?: string | null;
          profile_pic_url?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          website?: string | null;
          social_links?: Json | null;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          opening_hours?: Json | null;
          price_range?: string | null;
          subscription_tier?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['business_pages']['Insert']>;
      };
      allays: {
        Row: {
          id: string;
          user_id: string;
          page_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          page_id: string;
          created_at?: string;
        };
        Update: never;
      };
      scores: {
        Row: {
          id: string;
          user_id: string;
          page_id: string;
          professionalism: number;
          initiative: number;
          speed: number;
          communication: number;
          quality: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          page_id: string;
          professionalism: number;
          initiative: number;
          speed: number;
          communication: number;
          quality: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['scores']['Insert']>;
      };
      comments: {
        Row: {
          id: string;
          user_id: string;
          page_id: string;
          content: string;
          created_at: string;
          edited_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          page_id: string;
          content: string;
          created_at?: string;
          edited_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['comments']['Insert']>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      circle_type:
        | 'family'
        | 'extended_family'
        | 'city'
        | 'neighborhood'
        | 'street'
        | 'school'
        | 'university'
        | 'work'
        | 'gym'
        | 'other';
      friendship_status: 'pending' | 'accepted' | 'declined';
    };
  };
};
