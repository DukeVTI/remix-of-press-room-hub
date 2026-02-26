-- ============================================
-- ADMIN EXTENDED FEATURES MIGRATION (2026-02-25)
-- ============================================

-- 1. ADMIN ANNOUNCEMENTS TABLE
CREATE TABLE public.admin_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  target_audience TEXT NOT NULL DEFAULT 'all', -- all | publishers | new_users
  sent_by UUID NOT NULL REFERENCES public.platform_admins(id),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'draft', -- draft | sent
  recipient_count INTEGER DEFAULT 0
);

-- RLS: only platform admins can touch announcements
ALTER TABLE public.admin_announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Platform admins can manage announcements" ON public.admin_announcements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid() AND is_active)
  );

-- RLS for admin_activity_log (allow admins full access)
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Platform admins can read activity log" ON public.admin_activity_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid() AND is_active)
  );
CREATE POLICY "Platform admins can insert activity log" ON public.admin_activity_log
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid() AND is_active)
  );

-- RLS for admin_alerts
ALTER TABLE public.admin_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Platform admins can manage alerts" ON public.admin_alerts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid() AND is_active)
  );

-- RLS for platform_admins
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Platform admins can read all admins" ON public.platform_admins
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.platform_admins pa WHERE pa.user_id = auth.uid() AND pa.is_active)
  );
CREATE POLICY "Super admins can manage admins" ON public.platform_admins
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.platform_admins 
      WHERE user_id = auth.uid() AND is_active AND admin_role = 'super_admin'
    )
  );
