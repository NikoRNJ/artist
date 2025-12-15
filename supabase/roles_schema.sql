-- =============================================================================
-- Ink & Fade - User Profiles & Roles Schema
-- Execute this in the Supabase SQL Editor
-- =============================================================================

-- 1. Create the user_role enum type
do $$ begin
  create type user_role as enum ('client', 'artist');
exception
  when duplicate_object then null;
end $$;

-- 2. Create the profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role user_role, -- null until user selects during onboarding
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Enable Row Level Security
alter table public.profiles enable row level security;

-- 4. RLS Policies for profiles table

-- Users can view their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can insert their own profile (for the trigger, uses service role)
-- This policy allows the trigger function to insert
create policy "Enable insert for authenticated users only"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Artists can view other profiles (for booking context)
create policy "Artists can view client profiles for bookings"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'artist'
    )
  );

-- 5. Create trigger function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

-- 6. Create the trigger on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. Create index for faster lookups
create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_email_idx on public.profiles(email);

-- 8. Function to update the updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 9. Trigger to auto-update updated_at on profiles
drop trigger if exists on_profiles_updated on public.profiles;
create trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- =============================================================================
-- OPTIONAL: Helper function to check if user has selected a role
-- =============================================================================
create or replace function public.user_has_completed_onboarding(user_id uuid)
returns boolean
language plpgsql
security definer
as $$
declare
  user_role user_role;
begin
  select role into user_role from public.profiles where id = user_id;
  return user_role is not null;
end;
$$;
