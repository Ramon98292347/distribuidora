# GUIA_PARA_IA.md

## Objetivo
Este arquivo serve como contexto r�pido para qualquer IA que precise trabalhar neste projeto.

## Nome do sistema
ComercialPro

## Stack principal
- Frontend: React + TypeScript + Vite
- UI: Tailwind CSS + shadcn/ui + Radix
- Roteamento: react-router-dom
- Backend/Banco: Supabase

## Comandos essenciais
```bash
npm install
npm run dev
npm run build
npm run preview
```

## Estrutura de pastas
- `src/pages`: telas principais (Dashboard, Produtos, Vendas, Clientes, Relat�rios, Contas a Pagar)
- `src/components`: componentes reutilizaveis e UI
- `src/contexts`: estados globais (Auth, Data, Client)
- `src/integrations/supabase`: client e tipos do Supabase
- `src/utils`: funcoes utilitarias
- `src/types`: tipagens compartilhadas
- `supabase`: scripts SQL

## Fluxo de autenticacao
- Autenticacao via `AuthContext`
- Rotas protegidas em `src/App.tsx` com `ProtectedRoute`
- Layout principal em `src/components/Layout.tsx`

## Dados e regras importantes
- Produtos, vendas e vendas fiado usam `DataContext`
- Contas a pagar atualmente estao em armazenamento local (localStorage) via:
  - `src/utils/accountsPayable.ts`
  - `src/types/accountsPayable.ts`
  - `src/pages/AccountsPayable.tsx`
- Existe SQL pronto para migrar contas a pagar ao Supabase em:
  - `supabase/accounts_payable.sql`

## Navegacao e responsividade
- Desktop grande: sidebar lateral
- Mobile e tablet: menu inferior com botao `Mais`
- Ajustes de breakpoint estao em `src/components/Layout.tsx`

## Convencoes de alteracao
1. Manter TypeScript sem `any` desnecessario.
2. Preservar padrao visual atual (Tailwind + componentes existentes).
3. Evitar criar logica duplicada: reaproveitar contexts e utils.
4. Em alteracoes de fluxo, validar mobile e desktop.
5. Rodar build antes de finalizar:
   - `npm run build`

## Checklist minimo antes de concluir tarefa
1. Alteracao compila sem erro.
2. Rotas nao quebraram.
3. Tela funciona no mobile e desktop.
4. Nao introduzir referencias externas antigas (ex: Lovable/GPT Engineer).

## Arquivos-chave para come�ar r�pido
- `src/App.tsx`
- `src/components/Layout.tsx`
- `src/contexts/DataContext.tsx`
- `src/pages/Products.tsx`
- `src/pages/Dashboard.tsx`
- `src/pages/AccountsPayable.tsx`

## Observacoes
- Se for migrar contas a pagar para Supabase, atualizar:
  1. Tipos em `src/integrations/supabase/types.ts`
  2. Leitura/escrita hoje feita em localStorage
  3. Dashboard para usar consulta real ao banco


