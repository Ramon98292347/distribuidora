# Instruções para Correção Manual dos Erros no Supabase

## Erros Identificados

Com base nas imagens compartilhadas e no feedback recebido, identificamos quatro erros principais:

1. **Erro ao adicionar cliente**: "new row violates row-level security policy for table 'clients'"
2. **Erro ao adicionar produto**: "Could not find the 'image' column of 'products' in the schema cache"
3. **Erro ao carregar vendas**: "column sale_items_1.price does not exist"
4. **Erro na tabela de vendas a crédito**: "relação 'credit_sales' não existe"

## Como Aplicar a Correção

### Método 1: Usando o SQL Editor do Supabase (Recomendado)

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá para "SQL Editor"
4. Crie um novo script SQL
5. Cole o conteúdo do arquivo `correcao-completa-atualizada.sql` que criamos
6. Clique em "Run" para executar o SQL

### Método 2: Correção Manual por Etapas

Se preferir fazer as correções manualmente, siga estas etapas:

#### 1. Criar as tabelas de vendas a crédito

1. Vá para "SQL Editor"
2. Crie um novo script SQL
3. Cole o conteúdo do arquivo `create-credit-sales-tables.sql`
4. Clique em "Run" para executar o SQL

#### 2. Adicionar a coluna 'image' na tabela 'products'

1. Vá para "Table Editor" > "products"
2. Clique em "Edit table"
3. Adicione uma nova coluna chamada "image" do tipo "text"
4. Clique em "Save"

#### 3. Adicionar a coluna 'price' na tabela 'sale_items'

1. Vá para "Table Editor" > "sale_items"
2. Clique em "Edit table"
3. Adicione uma nova coluna chamada "price" do tipo "numeric(10,2)" com valor padrão "0"
4. Marque a opção "Not Null"
5. Clique em "Save"

#### 4. Corrigir as políticas RLS (Row Level Security)

1. Vá para "Authentication" > "Policies"
2. Para cada tabela (products, clients, sales, sale_items, credit_sales, credit_sale_items, product_images):
   - Clique na tabela
   - Remova todas as políticas existentes (clique nos três pontos ao lado de cada política e selecione "Delete policy")
   - Clique em "New Policy"
   - Selecione "Create a policy from scratch"
   - Dê um nome como "Allow all operations"
   - Em "Target roles", selecione "authenticated"
   - Em "Policy definition", selecione "Using expression" e digite "true"
   - Marque todas as operações (SELECT, INSERT, UPDATE, DELETE)
   - Clique em "Save policy"

## Verificação

Após aplicar as correções, tente novamente:

1. Adicionar um cliente
2. Adicionar um produto com imagem
3. Registrar uma venda
4. Registrar uma venda fiado (a crédito)

Se tudo estiver funcionando corretamente, os erros não devem mais aparecer.

## Observações Importantes

- As políticas RLS configuradas nesta correção são permissivas (permitem todas as operações para usuários autenticados). Em um ambiente de produção, você deve considerar políticas mais restritivas.
- Se você estiver usando o sistema em produção, faça um backup do banco de dados antes de aplicar estas correções.
- Se ainda encontrar problemas após aplicar estas correções, verifique os logs do Supabase para obter mais informações sobre os erros.

## Resumo das Correções

1. **Criação das tabelas de vendas a crédito**: Criação das tabelas `credit_sales` e `credit_sale_items` que estavam faltando.
2. **Adição da coluna 'image'**: Adição da coluna `image` na tabela `products`.
3. **Adição da coluna 'price'**: Adição da coluna `price` na tabela `sale_items`.
4. **Correção das políticas RLS**: Configuração de políticas permissivas para todas as tabelas.