create table if not exists public.payees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  account_ref text not null check (char_length(account_ref) between 1 and 40),
  created_at timestamptz not null default now()
);

create table if not exists public.transfers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  payee_id uuid references public.payees(id) on delete set null,
  amount numeric(12, 2) not null check (amount > 0),
  note text check (char_length(note) <= 200),
  created_at timestamptz not null default now()
);

create index if not exists payees_user_created_idx
  on public.payees(user_id, created_at desc);
create index if not exists transfers_user_created_idx
  on public.transfers(user_id, created_at desc);

alter table public.payees enable row level security;
alter table public.transfers enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'payees'
      and policyname = 'own payees'
  ) then
    create policy "own payees" on public.payees
      for all using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'transfers'
      and policyname = 'own transfers'
  ) then
    create policy "own transfers" on public.transfers
      for all using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end
$$;

grant select, insert, update, delete on public.payees to authenticated;
grant select, insert on public.transfers to authenticated;

notify pgrst, 'reload schema';
