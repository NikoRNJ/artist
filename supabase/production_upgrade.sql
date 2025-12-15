-- =============================================================================
-- Ink & Fade - Production Upgrade: Availability Engine & Booking Integrity
-- Execute this in the Supabase SQL Editor AFTER the initial schema.sql
-- =============================================================================

-- Enable required extensions
create extension if not exists btree_gist;

-- =============================================================================
-- TASK 1A: Artist Settings Table (Working Hours Configuration)
-- =============================================================================

create table if not exists public.artist_settings (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null unique references public.artists(id) on delete cascade,
  
  -- Working hours as JSONB: { "0": { "start": "09:00", "end": "18:00", "enabled": true }, ... }
  -- Keys 0-6 represent Sunday (0) through Saturday (6)
  working_hours jsonb not null default '{
    "0": { "start": "00:00", "end": "00:00", "enabled": false },
    "1": { "start": "09:00", "end": "18:00", "enabled": true },
    "2": { "start": "09:00", "end": "18:00", "enabled": true },
    "3": { "start": "09:00", "end": "18:00", "enabled": true },
    "4": { "start": "09:00", "end": "18:00", "enabled": true },
    "5": { "start": "09:00", "end": "18:00", "enabled": true },
    "6": { "start": "10:00", "end": "15:00", "enabled": true }
  }'::jsonb,
  
  -- Slot interval in minutes (how often slots can start: 15, 30, or 60)
  slot_interval integer not null default 30 check (slot_interval in (15, 30, 60)),
  
  -- Buffer time between appointments in minutes
  buffer_minutes integer not null default 0 check (buffer_minutes >= 0 and buffer_minutes <= 60),
  
  -- Timezone for the artist (IANA timezone identifier)
  timezone text not null default 'America/Santiago',
  
  -- Advance booking limits
  min_advance_hours integer not null default 2,    -- Minimum hours in advance to book
  max_advance_days integer not null default 60,    -- Maximum days in advance to book
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create index for fast lookups
create index if not exists artist_settings_artist_id_idx on public.artist_settings(artist_id);

-- Enable RLS
alter table public.artist_settings enable row level security;

-- RLS Policies for artist_settings
create policy "Public can read artist settings"
  on public.artist_settings for select
  using (true);

create policy "Artists can update their own settings"
  on public.artist_settings for update
  using (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() 
      and profiles.role = 'artist'
      -- In production, you'd also link profiles to artists via a user_id column
    )
  );

-- =============================================================================
-- TASK 1B: Add Snapshot Fields to Bookings (Price/Duration History)
-- =============================================================================

-- Add snapshot columns to preserve booking history
alter table public.bookings 
  add column if not exists price_snapshot numeric(10,2),
  add column if not exists duration_snapshot integer,
  add column if not exists service_name_snapshot text;

-- Add end_time column for range-based overlap detection
alter table public.bookings
  add column if not exists end_time timestamptz;

-- Update existing bookings to calculate end_time from service duration
-- This is a one-time migration for existing data
update public.bookings b
set 
  end_time = b.start_time + (coalesce(s.duration, 60) * interval '1 minute'),
  price_snapshot = coalesce(b.price_snapshot, s.price),
  duration_snapshot = coalesce(b.duration_snapshot, s.duration),
  service_name_snapshot = coalesce(b.service_name_snapshot, s.name)
from public.services s
where b.service_id = s.id 
  and b.end_time is null;

-- For bookings without a linked service, default to 60 minutes
update public.bookings
set end_time = start_time + interval '60 minutes'
where end_time is null;

-- Make end_time required for future bookings
alter table public.bookings 
  alter column end_time set not null;

-- =============================================================================
-- TASK 1C: Double-Booking Prevention Using EXCLUDE Constraint
-- =============================================================================

-- Create a function to get the booking range as tstzrange
create or replace function public.booking_time_range(start_time timestamptz, end_time timestamptz)
returns tstzrange
language sql
immutable
as $$
  select tstzrange(start_time, end_time, '[)');
$$;

-- Add exclusion constraint to prevent overlapping bookings for the same artist
-- This uses the btree_gist extension for the && (overlaps) operator
alter table public.bookings
  drop constraint if exists no_overlapping_bookings;

alter table public.bookings
  add constraint no_overlapping_bookings
  exclude using gist (
    artist_id with =,
    tstzrange(start_time, end_time, '[)') with &&
  )
  where (status != 'CANCELLED');

-- Create a more readable helper function to check for conflicts
create or replace function public.check_booking_conflict(
  p_artist_id uuid,
  p_start_time timestamptz,
  p_end_time timestamptz,
  p_exclude_booking_id uuid default null
)
returns boolean
language plpgsql
as $$
declare
  conflict_exists boolean;
begin
  select exists (
    select 1 from public.bookings
    where artist_id = p_artist_id
      and status != 'CANCELLED'
      and id != coalesce(p_exclude_booking_id, '00000000-0000-0000-0000-000000000000'::uuid)
      and tstzrange(start_time, end_time, '[)') && tstzrange(p_start_time, p_end_time, '[)')
  ) into conflict_exists;
  
  return conflict_exists;
end;
$$;

-- =============================================================================
-- TASK 1D: Trigger to Auto-Populate Snapshot Fields on Insert
-- =============================================================================

create or replace function public.handle_booking_insert()
returns trigger
language plpgsql
security definer
as $$
declare
  service_record record;
begin
  -- Fetch service details if service_id is provided
  if new.service_id is not null then
    select price, duration, name 
    into service_record
    from public.services 
    where id = new.service_id;
    
    -- Populate snapshot fields
    if service_record is not null then
      new.price_snapshot := coalesce(new.price_snapshot, service_record.price);
      new.duration_snapshot := coalesce(new.duration_snapshot, service_record.duration);
      new.service_name_snapshot := coalesce(new.service_name_snapshot, service_record.name);
      
      -- Calculate end_time if not provided
      if new.end_time is null then
        new.end_time := new.start_time + (service_record.duration * interval '1 minute');
      end if;
    end if;
  end if;
  
  -- Default end_time if still null (fallback to 60 minutes)
  if new.end_time is null then
    new.end_time := new.start_time + interval '60 minutes';
  end if;
  
  return new;
end;
$$;

drop trigger if exists on_booking_insert on public.bookings;
create trigger on_booking_insert
  before insert on public.bookings
  for each row execute procedure public.handle_booking_insert();

-- =============================================================================
-- TASK 1E: Auto-Create Artist Settings on Artist Insert
-- =============================================================================

create or replace function public.handle_new_artist()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.artist_settings (artist_id)
  values (new.id)
  on conflict (artist_id) do nothing;
  
  return new;
end;
$$;

drop trigger if exists on_artist_created on public.artists;
create trigger on_artist_created
  after insert on public.artists
  for each row execute procedure public.handle_new_artist();

-- Create settings for existing artists that don't have them
insert into public.artist_settings (artist_id)
select id from public.artists a
where not exists (
  select 1 from public.artist_settings s where s.artist_id = a.id
)
on conflict (artist_id) do nothing;

-- =============================================================================
-- TASK 1F: Helper Function for Availability Calculation
-- =============================================================================

-- Function to get available time slots for an artist on a specific date
create or replace function public.get_available_slots(
  p_artist_id uuid,
  p_date date,
  p_duration_minutes integer default 60
)
returns table(
  slot_start timestamptz,
  slot_end timestamptz
)
language plpgsql
security definer
as $$
declare
  v_settings record;
  v_day_of_week integer;
  v_day_config jsonb;
  v_work_start time;
  v_work_end time;
  v_is_enabled boolean;
  v_slot_time timestamptz;
  v_slot_end timestamptz;
  v_day_start timestamptz;
  v_day_end timestamptz;
begin
  -- Get artist settings
  select * into v_settings
  from public.artist_settings
  where artist_id = p_artist_id;
  
  if v_settings is null then
    return;
  end if;
  
  -- Get day of week (0 = Sunday, 6 = Saturday)
  v_day_of_week := extract(dow from p_date);
  
  -- Get working hours for this day
  v_day_config := v_settings.working_hours -> v_day_of_week::text;
  
  if v_day_config is null then
    return;
  end if;
  
  v_is_enabled := (v_day_config ->> 'enabled')::boolean;
  if not v_is_enabled then
    return;
  end if;
  
  v_work_start := (v_day_config ->> 'start')::time;
  v_work_end := (v_day_config ->> 'end')::time;
  
  -- Convert to timestamptz in artist's timezone
  v_day_start := (p_date::text || ' ' || v_work_start::text)::timestamp 
                 at time zone v_settings.timezone;
  v_day_end := (p_date::text || ' ' || v_work_end::text)::timestamp 
               at time zone v_settings.timezone;
  
  -- Generate slots
  v_slot_time := v_day_start;
  
  while v_slot_time + (p_duration_minutes * interval '1 minute') <= v_day_end loop
    v_slot_end := v_slot_time + (p_duration_minutes * interval '1 minute');
    
    -- Check if slot conflicts with existing bookings
    if not public.check_booking_conflict(p_artist_id, v_slot_time, v_slot_end) then
      slot_start := v_slot_time;
      slot_end := v_slot_end;
      return next;
    end if;
    
    v_slot_time := v_slot_time + (v_settings.slot_interval * interval '1 minute');
  end loop;
end;
$$;

-- =============================================================================
-- TASK 1G: Updated RLS Policies for Bookings
-- =============================================================================

-- Allow reading bookings for availability checks
drop policy if exists "public read bookings" on public.bookings;
create policy "public read bookings for availability"
  on public.bookings for select
  using (true);

-- Artists can manage their own bookings
drop policy if exists "artists manage own bookings" on public.bookings;
create policy "artists manage own bookings"
  on public.bookings for all
  using (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() 
      and profiles.role = 'artist'
    )
  );

-- =============================================================================
-- TASK 1H: Update timestamp trigger for artist_settings
-- =============================================================================

drop trigger if exists on_artist_settings_updated on public.artist_settings;
create trigger on_artist_settings_updated
  before update on public.artist_settings
  for each row execute procedure public.handle_updated_at();
