-- =====================================================
-- DATABASE SAAS UNICO - DISTRIBUIPRO
-- PostgreSQL / Supabase
-- =====================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- 1) ENUMS E FUNCOES BASE
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
    CREATE TYPE public.payment_method AS ENUM ('dinheiro', 'pix', 'cartao');
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- =====================================================
-- 2) SAAS (TENANT / ASSINATURA)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.organization_memberships (
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'user')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan_code TEXT NOT NULL DEFAULT 'trial',
  status TEXT NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'past_due', 'canceled')),
  trial_starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  trial_ends_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 3) PERFIL
-- =====================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'user' CHECK (type IN ('admin', 'manager', 'user')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 4) TABELAS DE NEGOCIO (MULTI-TENANT)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image TEXT,
  category TEXT,
  cost_price NUMERIC(12,2) CHECK (cost_price >= 0),
  profit_margin NUMERIC(6,2) CHECK (profit_margin >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL DEFAULT '',
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
  payment_method public.payment_method NOT NULL DEFAULT 'dinheiro',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
  total_price NUMERIC(12,2) NOT NULL CHECK (total_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.credit_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
  paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.credit_sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  credit_sale_id UUID NOT NULL REFERENCES public.credit_sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 5) FUNCOES DE CONTEXTO (TENANT)
-- =====================================================

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

CREATE OR REPLACE FUNCTION public.set_tenant_id_from_membership()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.organization_id IS NULL THEN
    NEW.organization_id := public.current_organization_id();
  END IF;
  RETURN NEW;
END;
$$;

-- =====================================================
-- 6) TRIGGERS
-- =====================================================

DROP TRIGGER IF EXISTS trg_org_updated_at ON public.organizations;
CREATE TRIGGER trg_org_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_clients_updated_at ON public.clients;
CREATE TRIGGER trg_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_sales_updated_at ON public.sales;
CREATE TRIGGER trg_sales_updated_at
BEFORE UPDATE ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_credit_sales_updated_at ON public.credit_sales;
CREATE TRIGGER trg_credit_sales_updated_at
BEFORE UPDATE ON public.credit_sales
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_product_images_updated_at ON public.product_images;
CREATE TRIGGER trg_product_images_updated_at
BEFORE UPDATE ON public.product_images
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_products_tenant ON public.products;
CREATE TRIGGER trg_products_tenant
BEFORE INSERT ON public.products
FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_from_membership();

DROP TRIGGER IF EXISTS trg_clients_tenant ON public.clients;
CREATE TRIGGER trg_clients_tenant
BEFORE INSERT ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_from_membership();

DROP TRIGGER IF EXISTS trg_sales_tenant ON public.sales;
CREATE TRIGGER trg_sales_tenant
BEFORE INSERT ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_from_membership();

DROP TRIGGER IF EXISTS trg_sale_items_tenant ON public.sale_items;
CREATE TRIGGER trg_sale_items_tenant
BEFORE INSERT ON public.sale_items
FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_from_membership();

DROP TRIGGER IF EXISTS trg_credit_sales_tenant ON public.credit_sales;
CREATE TRIGGER trg_credit_sales_tenant
BEFORE INSERT ON public.credit_sales
FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_from_membership();

DROP TRIGGER IF EXISTS trg_credit_sale_items_tenant ON public.credit_sale_items;
CREATE TRIGGER trg_credit_sale_items_tenant
BEFORE INSERT ON public.credit_sale_items
FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_from_membership();

DROP TRIGGER IF EXISTS trg_product_images_tenant ON public.product_images;
CREATE TRIGGER trg_product_images_tenant
BEFORE INSERT ON public.product_images
FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_from_membership();

-- =====================================================
-- 7) AUTO-PROVISIONAMENTO NO CADASTRO (TRIAL)
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user_trial_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_company_name TEXT;
  v_slug TEXT;
BEGIN
  v_company_name := COALESCE(NEW.raw_user_meta_data->>'company_name', 'Minha Distribuidora');
  v_slug := lower(regexp_replace(v_company_name, '[^a-zA-Z0-9]+', '-', 'g'));
  v_slug := trim(both '-' from v_slug);
  IF v_slug = '' THEN
    v_slug := 'org-' || substr(NEW.id::text, 1, 8);
  END IF;
  v_slug := v_slug || '-' || substr(NEW.id::text, 1, 6);

  INSERT INTO public.organizations(name, slug, created_by)
  VALUES (v_company_name, v_slug, NEW.id)
  RETURNING id INTO v_org_id;

  INSERT INTO public.organization_memberships(organization_id, user_id, role)
  VALUES (v_org_id, NEW.id, 'admin');

  INSERT INTO public.subscriptions(organization_id, plan_code, status)
  VALUES (v_org_id, 'trial', 'trialing');

  INSERT INTO public.profiles(id, name, type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'admin'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_trial ON auth.users;
CREATE TRIGGER on_auth_user_created_trial
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_trial_signup();

-- =====================================================
-- 8) INDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON public.organization_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_products_org_id ON public.products(organization_id);
CREATE INDEX IF NOT EXISTS idx_clients_org_id ON public.clients(organization_id);
CREATE INDEX IF NOT EXISTS idx_sales_org_id ON public.sales(organization_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON public.sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sale_items_org_id ON public.sale_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_credit_sales_org_id ON public.credit_sales(organization_id);
CREATE INDEX IF NOT EXISTS idx_credit_sale_items_org_id ON public.credit_sale_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_product_images_org_id ON public.product_images(organization_id);

-- =====================================================
-- 9) RLS
-- =====================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS p_org_select_own ON public.organizations;
CREATE POLICY p_org_select_own ON public.organizations
FOR SELECT TO authenticated
USING (id = public.current_organization_id());

DROP POLICY IF EXISTS p_org_members_select_own ON public.organization_memberships;
CREATE POLICY p_org_members_select_own ON public.organization_memberships
FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS p_subscriptions_select_own ON public.subscriptions;
CREATE POLICY p_subscriptions_select_own ON public.subscriptions
FOR SELECT TO authenticated
USING (organization_id = public.current_organization_id());

DROP POLICY IF EXISTS p_profiles_select ON public.profiles;
CREATE POLICY p_profiles_select ON public.profiles
FOR SELECT TO authenticated
USING (id = auth.uid());

DROP POLICY IF EXISTS p_profiles_insert ON public.profiles;
CREATE POLICY p_profiles_insert ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS p_profiles_update ON public.profiles;
CREATE POLICY p_profiles_update ON public.profiles
FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS p_products_all ON public.products;
CREATE POLICY p_products_all ON public.products
FOR ALL TO authenticated
USING (organization_id = public.current_organization_id() AND public.can_use_app())
WITH CHECK (organization_id = public.current_organization_id() AND public.can_use_app());

DROP POLICY IF EXISTS p_clients_all ON public.clients;
CREATE POLICY p_clients_all ON public.clients
FOR ALL TO authenticated
USING (organization_id = public.current_organization_id() AND public.can_use_app())
WITH CHECK (organization_id = public.current_organization_id() AND public.can_use_app());

DROP POLICY IF EXISTS p_sales_all ON public.sales;
CREATE POLICY p_sales_all ON public.sales
FOR ALL TO authenticated
USING (organization_id = public.current_organization_id() AND public.can_use_app())
WITH CHECK (organization_id = public.current_organization_id() AND public.can_use_app());

DROP POLICY IF EXISTS p_sale_items_all ON public.sale_items;
CREATE POLICY p_sale_items_all ON public.sale_items
FOR ALL TO authenticated
USING (organization_id = public.current_organization_id() AND public.can_use_app())
WITH CHECK (organization_id = public.current_organization_id() AND public.can_use_app());

DROP POLICY IF EXISTS p_credit_sales_all ON public.credit_sales;
CREATE POLICY p_credit_sales_all ON public.credit_sales
FOR ALL TO authenticated
USING (organization_id = public.current_organization_id() AND public.can_use_app())
WITH CHECK (organization_id = public.current_organization_id() AND public.can_use_app());

DROP POLICY IF EXISTS p_credit_sale_items_all ON public.credit_sale_items;
CREATE POLICY p_credit_sale_items_all ON public.credit_sale_items
FOR ALL TO authenticated
USING (organization_id = public.current_organization_id() AND public.can_use_app())
WITH CHECK (organization_id = public.current_organization_id() AND public.can_use_app());

DROP POLICY IF EXISTS p_product_images_all ON public.product_images;
CREATE POLICY p_product_images_all ON public.product_images
FOR ALL TO authenticated
USING (organization_id = public.current_organization_id() AND public.can_use_app())
WITH CHECK (organization_id = public.current_organization_id() AND public.can_use_app());

COMMIT;
