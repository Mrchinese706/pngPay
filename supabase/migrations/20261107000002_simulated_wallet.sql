create table if not exists public.wallet_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  balance numeric(12, 2) not null default 0 check (balance >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.wallet_accounts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_type text not null check (entry_type in ('credit', 'debit')),
  amount numeric(12, 2) not null check (amount > 0),
  description text not null,
  transfer_id uuid references public.transfers(id) on delete restrict,
  created_at timestamptz not null default now()
);

create index if not exists wallet_transactions_user_created_idx
  on public.wallet_transactions(user_id, created_at desc);

alter table public.wallet_accounts enable row level security;
alter table public.wallet_transactions enable row level security;

create policy "Users read their own wallet"
  on public.wallet_accounts for select
  using (auth.uid() = user_id);

create policy "Users read their own wallet activity"
  on public.wallet_transactions for select
  using (auth.uid() = user_id);

grant select on public.wallet_accounts to authenticated;
grant select on public.wallet_transactions to authenticated;

create or replace function public.create_wallet_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.wallet_accounts (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists create_wallet_after_user_signup on auth.users;
create trigger create_wallet_after_user_signup
  after insert on auth.users
  for each row execute function public.create_wallet_for_new_user();

insert into public.wallet_accounts (user_id)
select id from auth.users
on conflict (user_id) do nothing;

create or replace function public.top_up_wallet(p_amount numeric)
returns numeric
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_wallet_id uuid;
  v_balance numeric(12, 2);
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;
  if p_amount is null or p_amount <= 0 or p_amount > 9999999999.99
    or p_amount <> round(p_amount, 2) then
    raise exception 'Enter a valid top-up amount';
  end if;

  select id into v_wallet_id
  from public.wallet_accounts
  where user_id = v_user_id
  for update;

  if v_wallet_id is null then
    raise exception 'Wallet is not initialized';
  end if;

  update public.wallet_accounts
  set balance = balance + p_amount
  where id = v_wallet_id
  returning balance into v_balance;

  insert into public.wallet_transactions (
    wallet_id, user_id, entry_type, amount, description
  )
  values (
    v_wallet_id, v_user_id, 'credit', p_amount, 'Simulated funds added'
  );

  return v_balance;
end;
$$;

create or replace function public.create_wallet_transfer(
  p_payee_id uuid,
  p_amount numeric,
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_wallet_id uuid;
  v_transfer_id uuid;
  v_payee_name text;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;
  if p_amount is null or p_amount <= 0 or p_amount > 9999999999.99
    or p_amount <> round(p_amount, 2) then
    raise exception 'Enter a valid transfer amount';
  end if;
  if p_note is not null and char_length(p_note) > 200 then
    raise exception 'Note must be 200 characters or fewer';
  end if;

  select name into v_payee_name
  from public.payees
  where id = p_payee_id and user_id = v_user_id;

  if v_payee_name is null then
    raise exception 'Selected payee was not found';
  end if;

  update public.wallet_accounts
  set balance = balance - p_amount
  where user_id = v_user_id and balance >= p_amount
  returning id into v_wallet_id;

  if v_wallet_id is null then
    raise exception 'Insufficient wallet balance';
  end if;

  insert into public.transfers (user_id, payee_id, amount, note)
  values (v_user_id, p_payee_id, p_amount, nullif(p_note, ''))
  returning id into v_transfer_id;

  insert into public.wallet_transactions (
    wallet_id, user_id, entry_type, amount, description, transfer_id
  )
  values (
    v_wallet_id,
    v_user_id,
    'debit',
    p_amount,
    'Transfer to ' || v_payee_name,
    v_transfer_id
  );

  return v_transfer_id;
end;
$$;

revoke all on function public.top_up_wallet(numeric) from public;
revoke all on function public.create_wallet_transfer(uuid, numeric, text) from public;
grant execute on function public.top_up_wallet(numeric) to authenticated;
grant execute on function public.create_wallet_transfer(uuid, numeric, text) to authenticated;

notify pgrst, 'reload schema';
