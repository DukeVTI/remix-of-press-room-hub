
-- 1. Atomic view_count increment (fixes race condition)
CREATE OR REPLACE FUNCTION public.increment_view_count(_post_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE posts SET view_count = view_count + 1 WHERE id = _post_id AND status = 'published';
$$;

-- 2. Secure email lookup for admin assignment (returns only id, prevents PII exposure)
CREATE OR REPLACE FUNCTION public.find_profile_id_by_email(_email text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM profiles WHERE lower(email) = lower(_email) LIMIT 1;
$$;
