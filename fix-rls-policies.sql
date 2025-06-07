-- Script para corrigir as políticas de segurança (RLS) no banco de dados
-- Execute este SQL no SQL Editor do Supabase

-- 1. DESABILITAR RLS TEMPORARIAMENTE PARA PERMITIR INSERÇÕES
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE credit_sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE credit_sale_items DISABLE ROW LEVEL SECURITY;

-- 2. REABILITAR RLS COM POLÍTICAS MAIS PERMISSIVAS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_sale_items ENABLE ROW LEVEL SECURITY;

-- 3. REMOVER POLÍTICAS EXISTENTES QUE POSSAM ESTAR CAUSANDO PROBLEMAS
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON products;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON clients;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON sales;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON sale_items;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON credit_sales;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON credit_sale_items;

DROP POLICY IF EXISTS "Allow all operations" ON products;
DROP POLICY IF EXISTS "Allow all operations" ON clients;
DROP POLICY IF EXISTS "Allow all operations" ON sales;
DROP POLICY IF EXISTS "Allow all operations" ON sale_items;
DROP POLICY IF EXISTS "Allow all operations" ON credit_sales;
DROP POLICY IF EXISTS "Allow all operations" ON credit_sale_items;

-- 4. CRIAR POLÍTICAS PERMISSIVAS (PERMITIR ACESSO PARA TODOS OS USUÁRIOS)
CREATE POLICY "Allow all operations" ON products FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON clients FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON sales FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON sale_items FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON credit_sales FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON credit_sale_items FOR ALL USING (true);

-- 5. VERIFICAR SE TUDO FUNCIONOU
SELECT 'Produtos cadastrados:' as info, COUNT(*) as total FROM products;
SELECT 'Clientes cadastrados:' as info, COUNT(*) as total FROM clients;
SELECT 'Vendas cadastradas:' as info, COUNT(*) as total FROM sales;
SELECT 'Vendas a prazo cadastradas:' as info, COUNT(*) as total FROM credit_sales;