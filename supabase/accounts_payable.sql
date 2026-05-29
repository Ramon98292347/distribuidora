-- Estrutura sugerida para persistencia no Supabase
create table if not exists public.accounts_payable (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  supplier text not null,
  category text not null,
  value numeric(12,2) not null check (value > 0),
  due_date date not null,
  status text not null check (status in ('aberta','paga','vencida')) default 'aberta',
  payment_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_accounts_payable_due_date on public.accounts_payable(due_date);
create index if not exists idx_accounts_payable_status on public.accounts_payable(status);
create index if not exists idx_accounts_payable_payment_date on public.accounts_payable(payment_date);

-- Opcional: trigger de updated_at
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
