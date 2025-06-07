-- Script de correção completa para todos os erros do sistema
-- Execute este script no SQL Editor do Supabase

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
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE credit_sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE credit_sale_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_images DISABLE ROW LEVEL SECURITY;

-- Remover políticas existentes que possam estar causando problemas
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON products;
DROP POLICY IF EXISTS "Allow all operations" ON products;

DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON clients;
DROP POLICY IF EXISTS "Allow all operations" ON clients;

DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON sales;
DROP POLICY IF EXISTS "Allow all operations" ON sales;

DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON sale_items;
DROP POLICY IF EXISTS "Allow all operations" ON sale_items;

DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON credit_sales;
DROP POLICY IF EXISTS "Allow all operations" ON credit_sales;

DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON credit_sale_items;
DROP POLICY IF EXISTS "Allow all operations" ON credit_sale_items;

DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON product_images;
DROP POLICY IF EXISTS "Allow all operations" ON product_images;

-- Criar políticas permissivas para todas as tabelas
CREATE POLICY "Allow all operations" ON products FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON clients FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON sales FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON sale_items FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON credit_sales FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON credit_sale_items FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON product_images FOR ALL USING (true);

-- Reabilitar RLS com as novas políticas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-----------------------------------------
-- 4. VERIFICAÇÃO FINAL
-----------------------------------------

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