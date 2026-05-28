-- =====================================================
-- MIGRACAO: 3 PLANOS + COLUNA DE ASSINATURA
-- =====================================================

BEGIN;

-- 1) Catalogo de planos
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  code TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  valor_mensal NUMERIC(10,2) NOT NULL CHECK (valor_mensal >= 0),
  limite_usuarios INTEGER,
  limite_produtos INTEGER,
  limite_clientes INTEGER,
  recursos JSONB NOT NULL DEFAULT '{}'::jsonb,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_subscription_plans_updated_at ON public.subscription_plans;
CREATE TRIGGER trg_subscription_plans_updated_at
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Seed dos 3 planos
INSERT INTO public.subscription_plans (
  code, nome, valor_mensal, limite_usuarios, limite_produtos, limite_clientes, recursos
)
VALUES
  (
    'essencial',
    'Essencial',
    99.90,
    3,
    2000,
    5000,
    '{"relatorios_avancados": false, "suporte_prioritario": false}'::jsonb
  ),
  (
    'profissional',
    'Profissional',
    199.90,
    10,
    10000,
    20000,
    '{"relatorios_avancados": true, "suporte_prioritario": false}'::jsonb
  ),
  (
    'enterprise',
    'Enterprise',
    399.90,
    NULL,
    NULL,
    NULL,
    '{"relatorios_avancados": true, "suporte_prioritario": true}'::jsonb
  ),
  (
    'trial',
    'Trial',
    0.00,
    3,
    2000,
    5000,
    '{"trial_dias": 7}'::jsonb
  )
ON CONFLICT (code) DO UPDATE SET
  nome = EXCLUDED.nome,
  valor_mensal = EXCLUDED.valor_mensal,
  limite_usuarios = EXCLUDED.limite_usuarios,
  limite_produtos = EXCLUDED.limite_produtos,
  limite_clientes = EXCLUDED.limite_clientes,
  recursos = EXCLUDED.recursos,
  ativo = TRUE,
  updated_at = NOW();

-- 3) Coluna de assinatura na organizacao
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS assinatura_plano TEXT;

UPDATE public.organizations
SET assinatura_plano = 'essencial'
WHERE assinatura_plano IS NULL;

ALTER TABLE public.organizations
  ALTER COLUMN assinatura_plano SET DEFAULT 'essencial';

-- FK da coluna de assinatura para o catalogo
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_schema = 'public'
      AND table_name = 'organizations'
      AND constraint_name = 'organizations_assinatura_plano_fkey'
  ) THEN
    ALTER TABLE public.organizations
      ADD CONSTRAINT organizations_assinatura_plano_fkey
      FOREIGN KEY (assinatura_plano) REFERENCES public.subscription_plans(code);
  END IF;
END
$$;

-- 4) subscriptions.plan_code ligado ao catalogo
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_schema = 'public'
      AND table_name = 'subscriptions'
      AND constraint_name = 'subscriptions_plan_code_fkey'
  ) THEN
    ALTER TABLE public.subscriptions
      ADD CONSTRAINT subscriptions_plan_code_fkey
      FOREIGN KEY (plan_code) REFERENCES public.subscription_plans(code);
  END IF;
END
$$;

-- 5) RLS basico para leitura dos planos por autenticados
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS p_subscription_plans_select_auth ON public.subscription_plans;
CREATE POLICY p_subscription_plans_select_auth ON public.subscription_plans
FOR SELECT TO authenticated
USING (ativo = TRUE);

COMMIT;
