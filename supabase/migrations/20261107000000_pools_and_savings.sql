create table if not exists public.pool_groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  purpose text not null check (char_length(purpose) between 1 and 160),
  target_amount numeric(12, 2) not null check (target_amount > 0),
  deadline date,
  category text not null default 'community',
  created_at timestamptz not null default now()
);

create table if not exists public.pool_contributions (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references public.pool_groups(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  contributor_name text not null default 'Me' check (char_length(contributor_name) between 1 and 80),
  amount numeric(12, 2) not null check (amount > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  category text not null default 'personal',
  target_amount numeric(12, 2) not null check (target_amount > 0),
  target_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.savings_contributions (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.savings_goals(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  created_at timestamptz not null default now()
);

create index if not exists pool_groups_user_created_idx
  on public.pool_groups(user_id, created_at desc);
create index if not exists pool_contributions_pool_created_idx
  on public.pool_contributions(pool_id, created_at desc);
create index if not exists savings_goals_user_created_idx
  on public.savings_goals(user_id, created_at desc);
create index if not exists savings_contributions_goal_created_idx
  on public.savings_contributions(goal_id, created_at desc);

alter table public.pool_groups enable row level security;
alter table public.pool_contributions enable row level security;
alter table public.savings_goals enable row level security;
alter table public.savings_contributions enable row level security;

create policy "Users manage their own pools"
  on public.pool_groups for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Pool owners read contributions"
  on public.pool_contributions for select
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.pool_groups
      where pool_groups.id = pool_contributions.pool_id
        and pool_groups.user_id = auth.uid()
    )
  );

create policy "Pool owners add their contributions"
  on public.pool_contributions for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.pool_groups
      where pool_groups.id = pool_contributions.pool_id
        and pool_groups.user_id = auth.uid()
    )
  );

create policy "Users manage their own savings goals"
  on public.savings_goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Goal owners read savings contributions"
  on public.savings_contributions for select
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.savings_goals
      where savings_goals.id = savings_contributions.goal_id
        and savings_goals.user_id = auth.uid()
    )
  );

create policy "Goal owners add savings contributions"
  on public.savings_contributions for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.savings_goals
      where savings_goals.id = savings_contributions.goal_id
        and savings_goals.user_id = auth.uid()
    )
  );

grant select, insert, update, delete on public.pool_groups to authenticated;
grant select, insert on public.pool_contributions to authenticated;
grant select, insert, update, delete on public.savings_goals to authenticated;
grant select, insert on public.savings_contributions to authenticated;
