# Estudo de Planos e Assinatura (SaaS)

## Objetivo
- Criar 3 planos comerciais no banco.
- Criar coluna de assinatura para facilitar leitura rápida no sistema.
- Manter compatibilidade com a tabela `subscriptions` já existente.

## Situação atual
- Já existe `subscriptions` com:
  - `plan_code` (texto)
  - `status` (`trialing`, `active`, `past_due`, `canceled`)
  - período de trial
- O trial de 7 dias já está funcionando no cadastro.

## Proposta de modelagem
1. Criar tabela de catálogo de planos: `subscription_plans`.
2. Criar coluna de assinatura em `organizations`:
   - `assinatura_plano` (ex.: `essencial`, `profissional`, `enterprise`)
3. Relacionar `subscriptions.plan_code` ao catálogo de planos.

## 3 planos sugeridos
1. `essencial`
- Valor: R$ 99,90/mês
- Limites: 3 usuários, 2.000 produtos, 5.000 clientes

2. `profissional`
- Valor: R$ 199,90/mês
- Limites: 10 usuários, 10.000 produtos, 20.000 clientes

3. `enterprise`
- Valor: R$ 399,90/mês
- Limites: usuários e cadastros ilimitados

## Regras recomendadas
- Novas contas entram como `trial` em `subscriptions` e `assinatura_plano = 'essencial'` em `organizations`.
- Quando o pagamento for aprovado:
  - `subscriptions.status = 'active'`
  - `subscriptions.plan_code` recebe o plano contratado.
  - `organizations.assinatura_plano` acompanha o plano atual.

## Benefícios da coluna `assinatura_plano`
- Consulta rápida no front e no painel admin.
- Menos joins em listagens administrativas.
- Ajuda em filtros de atendimento/comercial.

## Observação importante
- A fonte oficial de cobrança continua sendo `subscriptions`.
- A coluna em `organizations` funciona como espelho operacional.
