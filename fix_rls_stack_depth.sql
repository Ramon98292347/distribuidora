-- =====================================================
-- CORRECAO: stack depth limit exceeded (RLS recursivo)
-- Execute este arquivo no SQL Editor do Supabase
-- =====================================================

BEGIN;

-- 1) Funcoes de contexto sem recursao
CREATE OR REPLACE FUNCTION public.current_organization_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT om.organization_id
  FROM public.organization_memberships om
  WHERE om.user_id = auth.uid()
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.current_org_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT om.role
  FROM public.organization_memberships om
  WHERE om.user_id = auth.uid()
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin_or_manager()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_org_role() IN ('admin', 'manager'), false)
$$;

CREATE OR REPLACE FUNCTION public.can_use_app()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.subscriptions s
    WHERE s.organization_id = public.current_organization_id()
      AND (
        s.status = 'active'
        OR (s.status = 'trialing' AND s.trial_ends_at >= NOW())
      )
  )
$$;

-- 2) Politica da tabela memberships sem autorreferencia
DROP POLICY IF EXISTS p_org_members_select_own ON public.organization_memberships;
CREATE POLICY p_org_members_select_own ON public.organization_memberships
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- 3) Politica da tabela subscriptions mantendo isolamento
DROP POLICY IF EXISTS p_subscriptions_select_own ON public.subscriptions;
CREATE POLICY p_subscriptions_select_own ON public.subscriptions
FOR SELECT TO authenticated
USING (organization_id = public.current_organization_id());

COMMIT;
