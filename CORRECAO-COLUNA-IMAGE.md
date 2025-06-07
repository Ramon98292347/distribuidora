# Correção da Coluna 'image' na Tabela 'products'

## Problema Identificado

O erro `Could not find the 'image' column of 'products' in the schema cache` ocorre porque o código da aplicação está tentando acessar uma coluna chamada `image` na tabela `products`, mas essa coluna não existe no banco de dados.

## Solução

Precisamos adicionar a coluna `image` à tabela `products` no banco de dados Supabase.

### Opção 1: Usando o SQL Editor do Supabase

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá para "SQL Editor"
4. Crie um novo script SQL
5. Cole o conteúdo abaixo:

```sql
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
```

6. Clique em "Run" para executar o SQL

### Opção 2: Usando o Table Editor do Supabase

1. Vá para "Table Editor" > "products"
2. Clique em "Edit table"
3. Adicione uma nova coluna chamada "image" do tipo "text"
4. Clique em "Save"

## Verificação

Após aplicar a correção, tente novamente adicionar um produto na aplicação. O erro não deve mais aparecer.

## Informações Adicionais

A coluna `image` é usada para armazenar URLs ou referências a imagens dos produtos. Embora exista uma tabela separada `product_images` para gerenciar múltiplas imagens por produto, a coluna `image` na tabela `products` parece ser usada para armazenar uma imagem principal ou temporária.

Se você continuar enfrentando problemas com as políticas de segurança (RLS), execute o seguinte SQL adicional:

```sql
-- Desabilitar RLS temporariamente
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Remover políticas existentes que possam estar causando problemas
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON products;
DROP POLICY IF EXISTS "Allow all operations" ON products;

-- Criar política permissiva
CREATE POLICY "Allow all operations" ON products FOR ALL USING (true);

-- Reabilitar RLS com a nova política
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
```

Este SQL irá configurar as políticas de segurança para permitir todas as operações na tabela `products`.