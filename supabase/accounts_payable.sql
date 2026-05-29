-- Estrutura de contas a pagar para o ComercialPro
create table if not exists public.accounts_payable (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  supplier text not null,
  category text not null,
  value numeric(12,2) not null check (value > 0),
  due_date date not null,
  status text not null check (status in ('aberta','paga','vencida','cancelada')) default 'aberta',
  payment_date date,
  payment_method text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ajustes para ambientes onde a tabela já existia antes
alter table public.accounts_payable
  add column if not exists payment_method text;

alter table public.accounts_payable
  drop constraint if exists accounts_payable_status_check;

alter table public.accounts_payable
  add constraint accounts_payable_status_check
  check (status in ('aberta','paga','vencida','cancelada'));

create index if not exists idx_accounts_payable_due_date on public.accounts_payable(due_date);
create index if not exists idx_accounts_payable_status on public.accounts_payable(status);
create index if not exists idx_accounts_payable_payment_date on public.accounts_payable(payment_date);
create index if not exists idx_accounts_payable_supplier on public.accounts_payable(supplier);
create index if not exists idx_accounts_payable_category on public.accounts_payable(category);

create or replace function public.set_accounts_payable_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_accounts_payable_updated_at on public.accounts_payable;
create trigger trg_accounts_payable_updated_at
before update on public.accounts_payable
for each row
execute function public.set_accounts_payable_updated_at();
