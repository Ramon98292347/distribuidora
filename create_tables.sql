-- Criar tabela credit_sales
CREATE TABLE IF NOT EXISTS public.credit_sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id),
  client_name TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  total NUMERIC NOT NULL,
  description TEXT,
  is_paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela credit_sale_items
CREATE TABLE IF NOT EXISTS public.credit_sale_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  credit_sale_id UUID REFERENCES public.credit_sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Adicionar políticas RLS para credit_sales
CREATE POLICY "Enable all access for authenticated users" ON public.credit_sales
  USING (auth.role() = 'authenticated');

-- Adicionar políticas RLS para credit_sale_items
CREATE POLICY "Enable all access for authenticated users" ON public.credit_sale_items
  USING (auth.role() = 'authenticated');