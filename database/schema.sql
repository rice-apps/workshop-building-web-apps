-- Host reference for a dedicated, existing Supabase demo project.
-- Inspect before running in SQL Editor. No grants, policies, or auth settings changed here.
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  created_at timestamptz not null default now()
);
create table public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  class_year integer not null default 2028 check (class_year between 2000 and 2100),
  role text not null default 'developer' check (role in ('developer', 'designer')),
  created_at timestamptz not null default now()
);
