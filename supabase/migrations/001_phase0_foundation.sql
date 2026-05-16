-- ============================================================
-- Allay — Phase 0 Foundation Migration
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable PostGIS for future geo queries (distance filters)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable pg_trgm for fast text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ─── Users ────────────────────────────────────────────────────
-- Mirror of auth.users with app-specific profile fields.
-- Row is created in auth/callback on first OAuth login.
CREATE TABLE IF NOT EXISTS public.users (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email               TEXT NOT NULL,
  phone               TEXT,
  name                TEXT,
  profile_pic_url     TEXT,
  bio                 TEXT CHECK (char_length(bio) <= 200),
  city                TEXT,
  privacy_max_steps   SMALLINT NOT NULL DEFAULT 6 CHECK (privacy_max_steps BETWEEN 1 AND 6),
  oauth_provider      TEXT,
  onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Allow authenticated users to read any profile (paths need this)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read any profile"
  ON public.users FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ─── Friendships ──────────────────────────────────────────────
-- Canonical: user_a_id < user_b_id (alphabetical UUID ordering).
CREATE TABLE IF NOT EXISTS public.friendships (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_b_id   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,

  -- Canonical ordering enforced at INSERT time
  CONSTRAINT friendships_canonical_order CHECK (user_a_id < user_b_id),
  -- One edge per pair
  CONSTRAINT friendships_unique_pair UNIQUE (user_a_id, user_b_id)
);

-- Trigger: enforce 150-friend cap per user
CREATE OR REPLACE FUNCTION check_friend_cap()
RETURNS TRIGGER AS $$
DECLARE
  friend_count INTEGER;
BEGIN
  -- Count accepted friends for each participant
  SELECT COUNT(*) INTO friend_count
  FROM public.friendships
  WHERE (user_a_id = NEW.user_a_id OR user_b_id = NEW.user_a_id)
    AND status = 'accepted';

  IF friend_count >= 150 THEN
    RAISE EXCEPTION 'Friend cap reached for user %', NEW.user_a_id;
  END IF;

  SELECT COUNT(*) INTO friend_count
  FROM public.friendships
  WHERE (user_a_id = NEW.user_b_id OR user_b_id = NEW.user_b_id)
    AND status = 'accepted';

  IF friend_count >= 150 THEN
    RAISE EXCEPTION 'Friend cap reached for user %', NEW.user_b_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_friend_cap
  BEFORE INSERT OR UPDATE ON public.friendships
  FOR EACH ROW
  WHEN (NEW.status = 'accepted')
  EXECUTE FUNCTION check_friend_cap();

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Friends visible to participants"
  ON public.friendships FOR SELECT
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

CREATE POLICY "Anyone authenticated can send a friend request"
  ON public.friendships FOR INSERT
  WITH CHECK (auth.uid() = user_a_id OR auth.uid() = user_b_id);

CREATE POLICY "Participants can update (accept/decline)"
  ON public.friendships FOR UPDATE
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- Indexes for graph traversal
CREATE INDEX IF NOT EXISTS idx_friendships_a ON public.friendships(user_a_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_b ON public.friendships(user_b_id, status);

-- ─── Friend Circles ───────────────────────────────────────────
CREATE TYPE circle_type AS ENUM (
  'family', 'extended_family', 'city', 'neighborhood',
  'street', 'school', 'university', 'work', 'gym', 'other'
);

CREATE TABLE IF NOT EXISTS public.friend_circles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,  -- the labeler
  friend_id   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,  -- the labeled
  circle      circle_type NOT NULL,

  UNIQUE (user_id, friend_id, circle)
);

ALTER TABLE public.friend_circles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own circle labels"
  ON public.friend_circles FOR ALL
  USING (auth.uid() = user_id);

-- ─── Bidirectional friendship view (for graph queries) ────────
CREATE OR REPLACE VIEW public.friendship_edges AS
  SELECT user_a_id AS src, user_b_id AS dst
    FROM public.friendships WHERE status = 'accepted'
  UNION ALL
  SELECT user_b_id AS src, user_a_id AS dst
    FROM public.friendships WHERE status = 'accepted';

-- ─── Bridge Opt-Outs ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bridge_optouts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  excluded_viewer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,  -- NULL = global
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, excluded_viewer_id)
);

ALTER TABLE public.bridge_optouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own opt-outs"
  ON public.bridge_optouts FOR ALL
  USING (auth.uid() = user_id);

-- ─── Categories ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_he     TEXT NOT NULL,
  name_en     TEXT,
  slug        TEXT NOT NULL UNIQUE,
  parent_id   UUID REFERENCES public.categories(id),
  emoji       TEXT,
  display_order SMALLINT NOT NULL DEFAULT 0
);

-- Public read, admin write (no RLS needed for read-only reference data)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read categories" ON public.categories FOR SELECT USING (true);

-- Seed categories
INSERT INTO public.categories (name_he, name_en, slug, emoji, display_order) VALUES
  ('בנייה ושיפוצים', 'Construction & Renovation', 'construction', '🔨', 1),
  ('חשמל', 'Electrician', 'electrician', '⚡', 2),
  ('אינסטלציה', 'Plumbing', 'plumbing', '🚿', 3),
  ('ניקיון', 'Cleaning', 'cleaning', '🧹', 4),
  ('מיזוג אוויר', 'HVAC', 'hvac', '❄️', 5),
  ('גינון ונוף', 'Landscaping', 'landscaping', '🌿', 6),
  ('נגרות ורהיטים', 'Carpentry & Furniture', 'carpentry', '🪑', 7),
  ('צביעה', 'Painting', 'painting', '🎨', 8),
  ('הובלות', 'Moving', 'moving', '🚚', 9),
  ('מנעולנות', 'Locksmith', 'locksmith', '🔐', 10),
  ('מטבחים ואמבטיות', 'Kitchens & Bathrooms', 'kitchens-bathrooms', '🍳', 11),
  ('אריחים ופרקט', 'Tiling & Flooring', 'flooring', '🏠', 12),
  ('גפ"ן ותקרות', 'Drywall & Ceilings', 'drywall', '🏗️', 13),
  ('שערים ואלומיניום', 'Gates & Aluminum', 'gates-aluminum', '🚪', 14),
  ('גג ואיטום', 'Roofing & Waterproofing', 'roofing', '🏡', 15),
  ('אבטחה ומצלמות', 'Security & CCTV', 'security', '📷', 16),
  ('עיצוב פנים', 'Interior Design', 'interior-design', '🛋️', 17),
  ('אדריכלות', 'Architecture', 'architecture', '📐', 18),
  ('פיתוח תוכנה', 'Software Development', 'software', '💻', 19),
  ('עיצוב גרפי', 'Graphic Design', 'graphic-design', '🎭', 20),
  ('שיווק דיגיטלי', 'Digital Marketing', 'digital-marketing', '📱', 21),
  ('צילום', 'Photography', 'photography', '📸', 22),
  ('וידאו ועריכה', 'Video & Editing', 'video-editing', '🎬', 23),
  ('תרגום', 'Translation', 'translation', '🌐', 24),
  ('ייעוץ עסקי', 'Business Consulting', 'business-consulting', '💼', 25),
  ('ראיית חשבון', 'Accounting', 'accounting', '📊', 26),
  ('עורכי דין', 'Lawyers', 'lawyers', '⚖️', 27),
  ('רפואה ובריאות', 'Health & Medicine', 'health', '🏥', 28),
  ('פסיכולוגיה וטיפול', 'Psychology & Therapy', 'therapy', '🧠', 29),
  ('אימון אישי', 'Personal Training', 'personal-training', '💪', 30),
  ('יופי ואסתטיקה', 'Beauty & Aesthetics', 'beauty', '💅', 31),
  ('חינוך ופדגוגיה', 'Education & Tutoring', 'education', '📚', 32),
  ('אוכל ואירועים', 'Food & Events', 'food-events', '🍽️', 33),
  ('מוזיקה ואמנות', 'Music & Art', 'music-art', '🎵', 34),
  ('וטרינריה', 'Veterinary', 'veterinary', '🐾', 35),
  ('תיקוני רכב', 'Auto Repair', 'auto-repair', '🔧', 36),
  ('נסיעות ותיירות', 'Travel & Tourism', 'travel', '✈️', 37),
  ('ביטוח', 'Insurance', 'insurance', '🛡️', 38),
  ('נדל"ן', 'Real Estate', 'real-estate', '🏢', 39),
  ('אחר', 'Other', 'other', '💡', 40)
ON CONFLICT (slug) DO NOTHING;

-- ─── Storage buckets ──────────────────────────────────────────
-- Run separately in Supabase Storage UI, or via CLI:
-- supabase storage create profile-pics --public
-- supabase storage create business-photos --public

-- ─── Helpful function: get current user profile ───────────────
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS public.users AS $$
  SELECT * FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;
