-- =========================================================================
-- 1. REPAIR & SECURE: handle_new_user
-- =========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
-- 選 FIXES LINT 0011: Force function to resolve tables via explicit public schema
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (tut_email, full_name, user_type)
  VALUES (
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Unknown'),
    COALESCE(new.raw_user_meta_data->>'role', 'STUDENT')
  );
  RETURN new;
END;
$$;

-- 選 FIXES LINT 0028 & 0029: Revoke all web/API permissions completely
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;


-- =========================================================================
-- 2. REPAIR & SECURE: handle_new_user_registration_sync
-- =========================================================================
ALTER FUNCTION public.handle_new_user_registration_sync() 
  SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.handle_new_user_registration_sync() FROM public, anon, authenticated;


-- =========================================================================
-- 3. REPAIR & SECURE: sync_vendor_name_with_fullname
-- =========================================================================
ALTER FUNCTION public.sync_vendor_name_with_fullname() 
  SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.sync_vendor_name_with_fullname() FROM public, anon, authenticated;
