# Instruções para Correção do Erro de Sintaxe SQL

## Problema Identificado

Foi identificado um erro de sintaxe no script SQL original (`correcao-completa-atualizada.sql`). O erro ocorre na linha 63, próximo à palavra `BEGIN`, como mostrado na mensagem de erro:

```
ERROR: 42601: syntax error at or near "BEGIN"
LINE 63: BEGIN
         ^
```

## Solução

O problema foi corrigido no novo arquivo `correcao-completa-corrigida.sql`. A correção consistiu em garantir que todos os blocos `DO $$` estejam corretamente formatados e terminados com `END $$;`.

## Como Aplicar a Correção

1. Abra o painel do Supabase para seu projeto
2. Navegue até a seção "SQL Editor"
3. Abra o arquivo `correcao-completa-corrigida.sql` em seu computador
4. Copie todo o conteúdo do arquivo
5. Cole o conteúdo no editor SQL do Supabase
6. Clique em "Run" ou "Executar" para aplicar as correções

## O Que Este Script Faz

O script corrigido realiza as seguintes operações:

1. **Verifica e cria tabelas ausentes**:
   - Cria a tabela `credit_sales` se não existir
   - Cria a tabela `credit_sale_items` se não existir
   - Cria índices e triggers necessários

2. **Corrige a coluna 'image' na tabela 'products'**:
   - Adiciona a coluna `image` do tipo TEXT se não existir

3. **Corrige a coluna 'price' na tabela 'sale_items'**:
   - Adiciona a coluna `price` do tipo NUMERIC(10,2) se não existir

4. **Corrige as políticas RLS para todas as tabelas**:
   - Desabilita temporariamente o RLS
   - Remove políticas existentes que possam estar causando problemas
   - Cria novas políticas permissivas
   - Reabilita o RLS com as novas políticas

5. **Realiza verificação final**:
   - Lista as tabelas existentes
   - Verifica a estrutura das tabelas `products` e `sale_items`
   - Verifica as políticas RLS aplicadas

## Após a Execução

Depois de executar o script corrigido, você deve ser capaz de:

1. Adicionar clientes sem o erro de violação de política RLS
2. Adicionar produtos com a coluna 'image'
3. Carregar vendas com a coluna 'price' em 'sale_items'
4. Utilizar as funcionalidades de vendas a crédito com as tabelas `credit_sales` e `credit_sale_items`

Verifique se todas as operações estão funcionando corretamente após a aplicação do script. Se ainda houver problemas, verifique os logs de erro no console do Supabase para mais detalhes.