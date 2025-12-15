-- Ink & Fade - Supabase schema (mínimo para demo)
-- Ejecuta en el SQL editor de Supabase o con `supabase db reset` si usas Supabase CLI.

create extension if not exists pgcrypto;

create table if not exists artists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  title text not null,
  bio text not null,
  avatar text not null,
  rating numeric(3,2) not null default 0,
  review_count integer not null default 0,
  styles text[] not null default '{}',
  location text not null,
  created_at timestamptz not null default now()
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references artists(id) on delete cascade,
  name text not null,
  duration integer not null,
  price numeric(10,2) not null,
  deposit numeric(10,2) not null,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists portfolio_items (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references artists(id) on delete cascade,
  image_url text not null,
  description text not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references artists(id) on delete cascade,
  author text not null,
  rating integer not null check (rating between 1 and 5),
  content text not null,
  date text not null,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

do $$ begin
  create type booking_status as enum ('PENDING','CONFIRMED','COMPLETED','CANCELLED');
exception
  when duplicate_object then null;
end $$;

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references artists(id) on delete cascade,
  service_id uuid references services(id) on delete set null,
  client_name text not null,
  start_time timestamptz not null,
  status booking_status not null default 'PENDING',
  deposit_paid boolean not null default false,
  created_at timestamptz not null default now()
);

alter table artists enable row level security;
alter table services enable row level security;
alter table portfolio_items enable row level security;
alter table reviews enable row level security;
alter table bookings enable row level security;

-- Read-only público para catálogo (demo).
create policy "public read artists" on artists for select using (true);
create policy "public read services" on services for select using (true);
create policy "public read portfolio" on portfolio_items for select using (true);
create policy "public read reviews" on reviews for select using (true);

-- Booking insert (demo). En producción: limitar a authenticated y validar pagos/horarios.
create policy "public insert bookings" on bookings for insert with check (true);
