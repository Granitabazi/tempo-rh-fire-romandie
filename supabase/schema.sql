-- Tempo RH - structure initiale Supabase
-- À exécuter une seule fois dans Supabase > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  full_name text not null,
  role text not null default 'employee' check (role in ('employee','manager','hr','admin')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.app_snapshots (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

create or replace function public.current_organization_id()
returns uuid language sql stable security definer set search_path=public as $$
  select organization_id from public.profiles where id=auth.uid() and active=true
$$;

create or replace function public.current_role()
returns text language sql stable security definer set search_path=public as $$
  select role from public.profiles where id=auth.uid() and active=true
$$;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.app_snapshots enable row level security;

drop policy if exists "organization members can read organization" on public.organizations;
create policy "organization members can read organization" on public.organizations for select to authenticated
using (id=public.current_organization_id());

drop policy if exists "members can read coworkers" on public.profiles;
create policy "members can read coworkers" on public.profiles for select to authenticated
using (organization_id=public.current_organization_id());

drop policy if exists "admins manage profiles" on public.profiles;
create policy "admins manage profiles" on public.profiles for all to authenticated
using (organization_id=public.current_organization_id() and public.current_role() in ('hr','admin'))
with check (organization_id=public.current_organization_id() and public.current_role() in ('hr','admin'));

drop policy if exists "members read company snapshot" on public.app_snapshots;
create policy "members read company snapshot" on public.app_snapshots for select to authenticated
using (organization_id=public.current_organization_id());

drop policy if exists "members update company snapshot" on public.app_snapshots;
create policy "members update company snapshot" on public.app_snapshots for insert to authenticated
with check (organization_id=public.current_organization_id());

drop policy if exists "members change company snapshot" on public.app_snapshots;
create policy "members change company snapshot" on public.app_snapshots for update to authenticated
using (organization_id=public.current_organization_id())
with check (organization_id=public.current_organization_id());

insert into public.organizations(name,slug)
values ('Fire Romandie SA','fire-romandie')
on conflict (slug) do nothing;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('tempo-documents','tempo-documents',false,10485760,array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do nothing;

drop policy if exists "members read company documents" on storage.objects;
create policy "members read company documents" on storage.objects for select to authenticated
using (bucket_id='tempo-documents' and (storage.foldername(name))[1]=public.current_organization_id()::text);

drop policy if exists "members upload company documents" on storage.objects;
create policy "members upload company documents" on storage.objects for insert to authenticated
with check (bucket_id='tempo-documents' and (storage.foldername(name))[1]=public.current_organization_id()::text);

drop policy if exists "members update company documents" on storage.objects;
create policy "members update company documents" on storage.objects for update to authenticated
using (bucket_id='tempo-documents' and (storage.foldername(name))[1]=public.current_organization_id()::text);

drop policy if exists "hr delete company documents" on storage.objects;
create policy "hr delete company documents" on storage.objects for delete to authenticated
using (bucket_id='tempo-documents' and (storage.foldername(name))[1]=public.current_organization_id()::text and public.current_role() in ('hr','admin'));

