-- Backfill joined dates for existing users
-- Sets all profiles with NULL created_at to January 2, 2026
-- This only affects records with NULL created_at and does not overwrite existing values

BEGIN;

-- Update profiles with NULL created_at to January 2, 2026
UPDATE public.profiles
SET created_at = '2026-01-02'::TIMESTAMP WITH TIME ZONE
WHERE created_at IS NULL;

-- Log the operation result
DO $$
DECLARE
  affected_rows INTEGER;
BEGIN
  SELECT COUNT(*) INTO affected_rows
  FROM public.profiles
  WHERE created_at IS NOT NULL;
  
  RAISE NOTICE 'Backfill complete. Total profiles with joined_date: %', affected_rows;
END
$$;

COMMIT;
