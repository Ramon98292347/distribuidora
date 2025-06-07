-- Script de correção completa para todos os erros do sistema
-- Execute este script no SQL Editor do Supabase

-----------------------------------------
-- 0. VERIFICAR E CRIAR TABELAS AUSENTES
-----------------------------------------

-- Verificar se a tabela credit_sales existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credit_sales') THEN
        -- Criar tabela credit_sales
        CREATE TABLE IF NOT EXISTS credit_sales (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
            client_name VARCHAR(255) NOT NULL,
            total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
            paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
            remaining_amount DECIMAL(10,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
            status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'cancelled')),
            due_date DATE,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Tabela credit_sales criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela credit_sales já existe.';
    END IF;
    
    -- Verificar se a tabela credit_sale_items existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credit_sale_items') THEN
        -- Criar tabela credit_sale_items
        CREATE TABLE IF NOT EXISTS credit_sale_items (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            credit_sale_id UUID NOT NULL REFERENCES credit_sales(id) ON DELETE CASCADE,
            product_id UUID REFERENCES products(id) ON DELETE SET NULL,
            product_name VARCHAR(255) NOT NULL,
            quantity INTEGER NOT NULL CHECK (quantity > 0),
            price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
            total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * price) STORED,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Tabela credit_sale_items criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela credit_sale_items já existe.';
    END IF;
    
    -- Criar índices para as tabelas de vendas a crédito
    CREATE INDEX IF NOT EXISTS idx_credit_sales_client_id ON credit_sales(client_id);
    CREATE INDEX IF NOT EXISTS idx_credit_sales_status ON credit_sales(status);
    CREATE INDEX IF NOT EXISTS idx_credit_sale_items_credit_sale_id ON credit_sale_items(credit_sale_id);
    CREATE INDEX IF NOT EXISTS idx_credit_sale_items_product_id ON credit_sale_items(product_id);
    
    -- Criar trigger para atualizar updated_at
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_credit_sales_updated_at') THEN
        -- Verificar se a função update_updated_at_column existe
        IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        END IF;
        
        CREATE TRIGGER update_credit_sales_updated_at BEFORE UPDATE ON credit_sales
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

-----------------------------------------
-- 1. CORREÇÃO DA COLUNA 'IMAGE' NA TABELA 'PRODUCTS'
-----------------------------------------
DO $$
DECLARE
    image_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'image'
    ) INTO image_exists;
    
    -- Se a coluna não existe, adicionar
    IF NOT image_exists THEN
        EXECUTE 'ALTER TABLE products ADD COLUMN image TEXT';
        RAISE NOTICE 'Coluna image adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna image já existe. Nenhuma alteração necessária.';
    END IF;
END
$$;

-----------------------------------------
-- 2. CORREÇÃO DA COLUNA 'PRICE' NA TABELA 'SALE_ITEMS'
-----------------------------------------
DO $$
DECLARE
    price_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sale_items' AND column_name = 'price'
    ) INTO price_exists;
    
    -- Se a coluna não existe, adicionar
    IF NOT price_exists THEN
        EXECUTE 'ALTER TABLE sale_items ADD COLUMN price NUMERIC(10,2) NOT NULL DEFAULT 0';
        RAISE NOTICE 'Coluna price adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna price já existe. Nenhuma alteração necessária.';
    END IF;
END
$$;

-----------------------------------------
-- 3. CORREÇÃO DAS POLÍTICAS RLS PARA TODAS AS TABELAS
-----------------------------------------

-- Desabilitar RLS temporariamente para todas as tabelas
DO $$
BEGIN
    -- Desabilitar RLS para tabelas existentes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
        ALTER TABLE products DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') THEN
        ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sales') THEN
        ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sale_items') THEN
        ALTER TABLE sale_items DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credit_sales') THEN
        ALTER TABLE credit_sales DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credit_sale_items') THEN
        ALTER TABLE credit_sale_items DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_images') THEN
        ALTER TABLE product_images DISABLE ROW LEVEL SECURITY;
    END IF;
END
$$;

-- Remover políticas existentes que possam estar causando problemas
DO $$
BEGIN
    -- Remover políticas para tabelas existentes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
        DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON products;
        DROP POLICY IF EXISTS "Allow all operations" ON products;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') THEN
        DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON clients;
        DROP POLICY IF EXISTS "Allow all operations" ON clients;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sales') THEN
        DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON sales;
        DROP POLICY IF EXISTS "Allow all operations" ON sales;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sale_items') THEN
        DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON sale_items;
        DROP POLICY IF EXISTS "Allow all operations" ON sale_items;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credit_sales') THEN
        DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON credit_sales;
        DROP POLICY IF EXISTS "Allow all operations" ON credit_sales;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credit_sale_items') THEN
        DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON credit_sale_items;
        DROP POLICY IF EXISTS "Allow all operations" ON credit_sale_items;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_images') THEN
        DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON product_images;
        DROP POLICY IF EXISTS "Allow all operations" ON product_images;
    END IF;
END
$$;

-- Criar políticas permissivas para todas as tabelas
DO $$
BEGIN
    -- Criar políticas para tabelas existentes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
        CREATE POLICY "Allow all operations" ON products FOR ALL USING (true);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') THEN
        CREATE POLICY "Allow all operations" ON clients FOR ALL USING (true);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sales') THEN
        CREATE POLICY "Allow all operations" ON sales FOR ALL USING (true);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sale_items') THEN
        CREATE POLICY "Allow all operations" ON sale_items FOR ALL USING (true);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credit_sales') THEN
        CREATE POLICY "Allow all operations" ON credit_sales FOR ALL USING (true);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credit_sale_items') THEN
        CREATE POLICY "Allow all operations" ON credit_sale_items FOR ALL USING (true);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_images') THEN
        CREATE POLICY "Allow all operations" ON product_images FOR ALL USING (true);
    END IF;
END
$$;

-- Reabilitar RLS com as novas políticas
DO $$
BEGIN
    -- Reabilitar RLS para tabelas existentes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
        ALTER TABLE products ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') THEN
        ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sales') THEN
        ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sale_items') THEN
        ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credit_sales') THEN
        ALTER TABLE credit_sales ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credit_sale_items') THEN
        ALTER TABLE credit_sale_items ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_images') THEN
        ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
    END IF;
END
$$;

-----------------------------------------
-- 4. VERIFICAÇÃO FINAL
-----------------------------------------

-- Verificar tabelas existentes
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('products', 'clients', 'sales', 'sale_items', 'credit_sales', 'credit_sale_items', 'product_images')
ORDER BY table_name;

-- Verificar estrutura da tabela products
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY column_name;

-- Verificar estrutura da tabela sale_items
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sale_items' 
ORDER BY column_name;

-- Verificar as políticas RLS
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('products', 'clients', 'sales', 'sale_items', 'credit_sales', 'credit_sale_items', 'product_images');