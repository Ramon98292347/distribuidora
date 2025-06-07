# Instruções para Correção Manual do Banco de Dados

O sistema está enfrentando um problema ao cadastrar produtos, clientes e vendas devido a uma incompatibilidade entre o código e a estrutura do banco de dados. O erro específico é:

```
Erro ao adicionar produto
Could not find the 'stock' column of 'products' in the schema cache
```

## Problema Identificado

O problema ocorre porque no código TypeScript, a coluna é chamada `stock`, mas no banco de dados Supabase, a coluna é chamada `stock_quantity`.

## Solução

Siga estas etapas para corrigir o problema:

### 1. Acesse o Painel do Supabase

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Faça login com suas credenciais
3. Selecione o projeto "jeser-bebidas-gest"

### 2. Método 1: Usando o Editor de Tabelas

1. No menu lateral, clique em "Table Editor"
2. Selecione a tabela "products"
3. Clique no botão "Edit table" (ícone de lápis)
4. Localize a coluna "stock_quantity"
5. Clique no nome da coluna e renomeie para "stock"
6. Clique em "Save" para salvar as alterações

### 3. Método 2: Usando o Editor SQL

1. No menu lateral, clique em "SQL Editor"
2. Crie um novo script SQL
3. Cole o seguinte código SQL:

```sql
-- Renomear a coluna stock_quantity para stock
ALTER TABLE products RENAME COLUMN stock_quantity TO stock;

-- Verificar se a alteração foi aplicada
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'stock';
```

4. Clique em "Run" para executar o SQL

### 4. Corrigir as Políticas de Segurança (RLS)

Se após renomear a coluna ainda houver problemas de acesso, execute o seguinte SQL para corrigir as políticas de segurança:

```sql
-- Desabilitar RLS temporariamente
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items DISABLE ROW LEVEL SECURITY;

-- Remover políticas existentes que possam estar causando problemas
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON products;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON clients;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON sales;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON sale_items;

DROP POLICY IF EXISTS "Allow all operations" ON products;
DROP POLICY IF EXISTS "Allow all operations" ON clients;
DROP POLICY IF EXISTS "Allow all operations" ON sales;
DROP POLICY IF EXISTS "Allow all operations" ON sale_items;

-- Criar políticas permissivas
CREATE POLICY "Allow all operations" ON products FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON clients FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON sales FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON sale_items FOR ALL USING (true);

-- Reabilitar RLS com as novas políticas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
```

## Verificação

Após aplicar as correções, reinicie o aplicativo e tente cadastrar um produto novamente. O erro não deve mais ocorrer.

## Suporte

Se você continuar enfrentando problemas após seguir estas instruções, entre em contato com o suporte técnico para assistência adicional.