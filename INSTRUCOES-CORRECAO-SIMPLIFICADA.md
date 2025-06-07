# Instruções para Correção Simplificada dos Erros

## Problema Identificado

O script SQL anterior (`correcao-completa-corrigida.sql`) continua apresentando erro de sintaxe na linha 63, próximo à palavra `BEGIN`, como mostrado na mensagem de erro:

```
ERROR: 42601: syntax error at or near "BEGIN"
LINE 63: BEGIN
         ^
```

## Solução Simplificada

Criamos um novo script SQL simplificado (`correcao-simplificada.sql`) que evita problemas de sintaxe com os blocos DO. Este script:

1. Usa comandos SQL diretos sempre que possível
2. Simplifica a estrutura dos blocos DO
3. Divide operações complexas em comandos individuais

## Como Aplicar a Correção

1. Abra o painel do Supabase para seu projeto
2. Navegue até a seção "SQL Editor"
3. Abra o arquivo `correcao-simplificada.sql` em seu computador
4. Copie todo o conteúdo do arquivo
5. Cole o conteúdo no editor SQL do Supabase
6. Clique em "Run" ou "Executar" para aplicar as correções

## Executando o Script em Partes (Se Necessário)

Se ainda ocorrerem erros ao executar o script completo, você pode executá-lo em partes:

### Parte 1: Criação das Tabelas

Copie e execute apenas a seção "0. VERIFICAR E CRIAR TABELAS AUSENTES" (linhas 5-54).

### Parte 2: Adição de Colunas

Copie e execute as seções "1. CORREÇÃO DA COLUNA 'IMAGE'" e "2. CORREÇÃO DA COLUNA 'PRICE'" (linhas 56-85).

### Parte 3: Correção das Políticas RLS

Copie e execute a seção "3. CORREÇÃO DAS POLÍTICAS RLS" (linhas 87-135).

## O Que Este Script Faz

O script simplificado realiza as mesmas operações que o script anterior:

1. **Cria tabelas ausentes**:
   - Cria a tabela `credit_sales` se não existir
   - Cria a tabela `credit_sale_items` se não existir
   - Cria índices e triggers necessários

2. **Adiciona colunas ausentes**:
   - Adiciona a coluna `image` do tipo TEXT à tabela `products` se não existir
   - Adiciona a coluna `price` do tipo NUMERIC(10,2) à tabela `sale_items` se não existir

3. **Corrige as políticas RLS**:
   - Desabilita temporariamente o RLS
   - Remove políticas existentes que possam estar causando problemas
   - Cria novas políticas permissivas
   - Reabilita o RLS com as novas políticas

4. **Realiza verificação final**:
   - Lista as tabelas existentes
   - Verifica a estrutura das tabelas `products` e `sale_items`
   - Verifica as políticas RLS aplicadas

## Após a Execução

Depois de executar o script simplificado, você deve ser capaz de:

1. Adicionar clientes sem o erro de violação de política RLS
2. Adicionar produtos com a coluna 'image'
3. Carregar vendas com a coluna 'price' em 'sale_items'
4. Utilizar as funcionalidades de vendas a crédito com as tabelas `credit_sales` e `credit_sale_items`

Verifique se todas as operações estão funcionando corretamente após a aplicação do script. Se ainda houver problemas, verifique os logs de erro no console do Supabase para mais detalhes.