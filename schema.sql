create table if not exists public.humor_flavors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  remote_humor_flavor_id text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.humor_flavor_steps (
  id uuid primary key default gen_random_uuid(),
  flavor_id uuid not null references public.humor_flavors(id) on delete cascade,
  step_order integer not null,
  title text not null,
  prompt_template text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (flavor_id, step_order)
);

create table if not exists public.humor_flavor_runs (
  id uuid primary key default gen_random_uuid(),
  flavor_id uuid not null references public.humor_flavors(id) on delete cascade,
  image_url text not null,
  final_output text,
  raw_steps jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_humor_flavors_updated_at on public.humor_flavors;
create trigger trg_humor_flavors_updated_at
before update on public.humor_flavors
for each row
execute function public.set_updated_at();

drop trigger if exists trg_humor_flavor_steps_updated_at on public.humor_flavor_steps;
create trigger trg_humor_flavor_steps_updated_at
before update on public.humor_flavor_steps
for each row
execute function public.set_updated_at();

alter table public.humor_flavors enable row level security;
alter table public.humor_flavor_steps enable row level security;
alter table public.humor_flavor_runs enable row level security;

drop policy if exists "read flavors authenticated" on public.humor_flavors;
create policy "read flavors authenticated"
on public.humor_flavors
for select
to authenticated
using (true);

drop policy if exists "read steps authenticated" on public.humor_flavor_steps;
create policy "read steps authenticated"
on public.humor_flavor_steps
for select
to authenticated
using (true);

drop policy if exists "read runs authenticated" on public.humor_flavor_runs;
create policy "read runs authenticated"
on public.humor_flavor_runs
for select
to authenticated
using (true);
