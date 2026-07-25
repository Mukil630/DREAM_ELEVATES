-- ========================================================
-- DREAM ELEVATE - SUPABASE CLOUD DATABASE & STORAGE SCHEMA
-- ========================================================
-- Copy and run this entire script in Supabase:
-- Project Dashboard -> SQL Editor -> New query -> Run

-- 1. Custom Cake Orders Table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  email text not null,
  delivery_date date not null,
  cake_weight text not null,
  cake_flavor text,
  message text,
  status text not null default 'new'
);

-- 2. Registered Users Account Table
create table if not exists public.users (
  id text primary key,
  created_at timestamptz not null default now(),
  name text not null,
  phone text,
  email text
);

-- 3. Newsletter Subscribers Table
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null unique
);

-- 4. Menu Items, Baking Tools & Ingredients Catalog Table
create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  price_label text not null,
  rating numeric(3,1) not null default 4.5,
  review_count integer not null default 10,
  image_url text not null,
  category text default 'Custom Cakes',
  description text default '',
  sort_order integer not null default 0
);

-- Enable Row Level Security (RLS)
alter table public.orders enable row level security;
alter table public.users enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.menu_items enable row level security;

-- Policies for public and authenticated access
drop policy if exists "Anyone can submit orders" on public.orders;
create policy "Anyone can submit orders" on public.orders for insert to anon, authenticated with check (true);

drop policy if exists "Anyone can register users" on public.users;
create policy "Anyone can register users" on public.users for all to anon, authenticated using (true) with check (true);

drop policy if exists "Anyone can subscribe" on public.newsletter_subscribers;
create policy "Anyone can subscribe" on public.newsletter_subscribers for insert to anon, authenticated with check (true);

drop policy if exists "Anyone can read menu items" on public.menu_items;
create policy "Anyone can read menu items" on public.menu_items for select to anon, authenticated using (true);

drop policy if exists "Anyone can manage menu items" on public.menu_items;
create policy "Anyone can manage menu items" on public.menu_items for all to anon, authenticated using (true) with check (true);

-- 5. Supabase Cloud Storage Bucket for Cake & Product Images
insert into storage.buckets (id, name, public)
values ('cake-images', 'cake-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public Read Access for Cake Images" on storage.objects;
create policy "Public Read Access for Cake Images" on storage.objects for select to anon, authenticated using (bucket_id = 'cake-images');

drop policy if exists "Public Upload Access for Cake Images" on storage.objects;
create policy "Public Upload Access for Cake Images" on storage.objects for insert to anon, authenticated with check (bucket_id = 'cake-images');

-- Seed Initial Products Data
insert into public.menu_items (name, price_label, rating, review_count, image_url, category, description, sort_order) values
  ('Lavender Bloom Cake', '₹799', 4.8, 120, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop', 'Custom Cakes', 'Infused with organic lavender syrup and vanilla bean buttercream frosting.', 1),
  ('Dark Velvet Dream Cake', '₹1299', 4.9, 160, 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=800&auto=format&fit=crop', 'Custom Cakes', 'Rich dark chocolate cake layered with fudge and cocoa nibs.', 2),
  ('Professional Aluminium Cake Turntable', '₹1499', 4.9, 85, 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop', 'Baking Tools', 'Heavy-duty 12-inch smooth revolving aluminum stand for precision cake decorating.', 3),
  ('Pure Belgian Dark Chocolate Couverture (1kg)', '₹999', 4.9, 140, 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800&auto=format&fit=crop', 'Ingredients', '54.5% cocoa real chocolate buttons ideal for ganache, pralines, and baking.', 4)
on conflict do nothing;
