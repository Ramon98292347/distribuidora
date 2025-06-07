image.png-- Script para corrigir a coluna stock_quantity para stock na tabela products

-- Primeiro, verificar se a coluna stock_quantity existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'stock_quantity'
  ) THEN
    -- Renomear a coluna stock_quantity para stock
    ALTER TABLE products RENAME COLUMN stock_quantity TO stock;
    RAISE NOTICE 'Coluna stock_quantity renomeada para stock com sucesso!';
  ELSIF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'stock'
  ) THEN
    RAISE NOTICE 'A coluna stock já existe na tabela products. Nenhuma alteração necessária.';
  ELSE
    -- Se nenhuma das colunas existir, criar a coluna stock
    ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0;
    RAISE NOTICE 'Coluna stock criada com sucesso!';
  END IF;
END;
$$;

-- Verificar se as políticas RLS estão configuradas corretamente
DO $$
BEGIN
  -- Desabilitar RLS temporariamente para permitir operações
  EXECUTE 'ALTER TABLE products DISABLE ROW LEVEL SECURITY';
  
  -- Remover políticas existentes que possam estar causando problemas
  DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON products;
  DROP POLICY IF EXISTS "Allow all operations" ON products;
  
  -- Criar política permissiva
  CREATE POLICY "Allow all operations" ON products FOR ALL USING (true);
  
  -- Reabilitar RLS com a nova política
  EXECUTE 'ALTER TABLE products ENABLE ROW LEVEL SECURITY';
  
  RAISE NOTICE 'Políticas RLS atualizadas com sucesso!';
END;
$$;

-- Fazer o mesmo para as outras tabelas
DO $$
BEGIN
  -- Clientes
  EXECUTE 'ALTER TABLE clients DISABLE ROW LEVEL SECURITY';
  DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON clients;
  DROP POLICY IF EXISTS "Allow all operations" ON clients;
  CREATE POLICY "Allow all operations" ON clients FOR ALL USING (true);
  EXECUTE 'ALTER TABLE clients ENABLE ROW LEVEL SECURITY';
  
  -- Vendas
  EXECUTE 'ALTER TABLE sales DISABLE ROW LEVEL SECURITY';
  DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON sales;
  DROP POLICY IF EXISTS "Allow all operations" ON sales;
  CREATE POLICY "Allow all operations" ON sales FOR ALL USING (true);
  EXECUTE 'ALTER TABLE sales ENABLE ROW LEVEL SECURITY';
  
  -- Itens de venda
  EXECUTE 'ALTER TABLE sale_items DISABLE ROW LEVEL SECURITY';
  DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON sale_items;
  DROP POLICY IF EXISTS "Allow all operations" ON sale_items;
  CREATE POLICY "Allow all operations" ON sale_items FOR ALL USING (true);
  EXECUTE 'ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY';
  
  -- Vendas a prazo
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credit_sales') THEN
    EXECUTE 'ALTER TABLE credit_sales DISABLE ROW LEVEL SECURITY';
    DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON credit_sales;
    DROP POLICY IF EXISTS "Allow all operations" ON credit_sales;
    CREATE POLICY "Allow all operations" ON credit_sales FOR ALL USING (true);
    EXECUTE 'ALTER TABLE credit_sales ENABLE ROW LEVEL SECURITY';
  END IF;
  
  -- Itens de vendas a prazo
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credit_sale_items') THEN
    EXECUTE 'ALTER TABLE credit_sale_items DISABLE ROW LEVEL SECURITY';
    DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON credit_sale_items;
    DROP POLICY IF EXISTS "Allow all operations" ON credit_sale_items;
    CREATE POLICY "Allow all operations" ON credit_sale_items FOR ALL USING (true);
    EXECUTE 'ALTER TABLE credit_sale_items ENABLE ROW LEVEL SECURITY';
  END IF;
  
  RAISE NOTICE 'Políticas RLS atualizadas para todas as tabelas!';
END;
$$;

-- Verificar se tudo funcionou
SELECT 'Verificação de colunas:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY column_name;

-- Verificar especificamente a coluna stock
SELECT 'Verificação da coluna stock:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'stock';

-- Verificar políticas RLS
SELECT 'Verificação de políticas RLS:' as info;
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('products', 'clients', 'sales', 'sale_items');

-- Verificar o número de produtos e clientes registrados
SELECT 'Contagem de registros:' as info;
SELECT COUNT(*) AS total_products FROM products;
SELECT COUNT(*) AS total_clients FROM clients;

-- Verificar alguns detalhes dos produtos (se existirem)
SELECT 'Amostra de produtos:' as info;
SELECT id, name, price, stock FROM products LIMIT 5;

SELECT 'Verificação de políticas:' as info;
SELECT * FROM pg_policies WHERE tablename = 'products';