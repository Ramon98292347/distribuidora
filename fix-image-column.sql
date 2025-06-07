-- Script para adicionar a coluna 'image' na tabela 'products'

-- Verificar se a coluna 'image' já existe
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

-- Verificar se a coluna image existe após as alterações
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'image';

-- Desabilitar RLS temporariamente
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Remover políticas existentes que possam estar causando problemas
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON products;
DROP POLICY IF EXISTS "Allow all operations" ON products;

-- Criar política permissiva
CREATE POLICY "Allow all operations" ON products FOR ALL USING (true);

-- Reabilitar RLS com a nova política
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Verificar a estrutura da tabela products
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY column_name;

-- Verificar as políticas RLS
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'products';