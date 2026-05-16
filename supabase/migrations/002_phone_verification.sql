-- Add phone_verified flag and unique constraint on phone
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN NOT NULL DEFAULT false;

-- Ensure no two accounts share the same verified phone
-- (applied only when phone is non-null)
CREATE UNIQUE INDEX IF NOT EXISTS users_phone_unique
  ON public.users (phone)
  WHERE phone IS NOT NULL;
