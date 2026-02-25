-- ============================================
-- PLATFORM ADMIN SYSTEM MIGRATION (2026-02-25)
-- ============================================

-- 1. ENUM FOR ADMIN ROLES
CREATE TYPE public.admin_role_type AS ENUM ('super_admin', 'moderator', 'support');

-- 2. PLATFORM ADMINS TABLE
CREATE TABLE public.platform_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  admin_role public.admin_role_type NOT NULL,
  assigned_by UUID NOT NULL REFERENCES public.profiles(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  permissions TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login TIMESTAMPTZ,
  UNIQUE(user_id)
);

-- 3. ADMIN ACTIVITY LOG TABLE
CREATE TABLE public.admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.platform_admins(id),
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. ADMIN ALERTS TABLE
CREATE TABLE public.admin_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. UPDATE REPORTS TABLE FOR MODERATION
ALTER TABLE public.reports 
  ADD COLUMN reviewed_by UUID REFERENCES public.platform_admins(id),
  ADD COLUMN reviewed_at TIMESTAMPTZ,
  ADD COLUMN resolution_action TEXT,
  ADD COLUMN resolution_details TEXT;

-- 6. RLS POLICIES FOR PLATFORM ADMINS (EXAMPLE)
-- (You may need to further refine these for your needs)
-- Allow platform admins to select/insert/update/delete on all moderation tables
-- Example for reports:
CREATE POLICY "Platform admins can manage reports" ON public.reports
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid() AND is_active)
  );
