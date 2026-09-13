-- ==============================================================================
--   NET PLUS ENTERPRISES — Supabase Database Schema & Setup
--   Execute this script in your Supabase SQL Editor: Dashboard -> SQL Editor -> New query
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- ==============================================================================
-- 2. USERS TABLE (Direct User Sign-Up)
-- ==============================================================================
create table if not exists public.users (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text unique not null,
  password text not null,
  role text not null default 'retailer' check (role in ('admin', 'retailer')),
  status text not null default 'pending' check (status in ('onboarding', 'pending', 'approved', 'rejected', 'completed')),
  created_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.users enable row level security;
drop policy if exists "Allow all on users" on public.users;
create policy "Allow all on users" on public.users for all using (true) with check (true);

-- ==============================================================================
-- 3. CUST_DETAIL TABLE (Retailers and Admins linked to Supabase Auth)
-- ==============================================================================
create table if not exists public.cust_detail (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  role text not null default 'retailer' check (role in ('admin', 'retailer')),
  status text not null default 'pending' check (status in ('onboarding', 'pending', 'approved', 'rejected', 'completed')),
  
  -- Store Information
  store_name text,
  store_type text,
  licence_no text,
  gstin text,
  store_address text,
  city text,
  state text default 'Maharashtra',
  pincode text,
  
  -- Owner / Contact Details
  owner_name text,
  phone text,
  alternate_phone text,
  
  -- Uploaded Document URLs (Supabase Storage)
  licence_file_url text,
  licence_file_name text,
  shop_photo_url text,
  shop_photo_name text,
  
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 3. PRODUCTS TABLE (Pharmaceutical catalog with wholesale pricing)
-- ==============================================================================
create table if not exists public.products (
  id bigserial primary key,
  name text not null,
  generic text not null,
  manufacturer text not null,
  category text not null,
  price numeric(10, 2) not null check (price >= 0),
  mrp numeric(10, 2) not null check (mrp >= 0),
  unit text not null default 'Strip/10',
  stock integer not null default 0 check (stock >= 0),
  rx boolean not null default false,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Index for product search and category filtering
create index if not exists idx_products_category on public.products (category);
create index if not exists idx_products_name on public.products (name);

-- ==============================================================================
-- 4. ORDERS TABLE (Retailer order inquiries & fulfillment)
-- ==============================================================================
create table if not exists public.orders (
  id text primary key, -- e.g. 'ORD-1725940000000'
  user_id uuid references public.cust_detail(id) on delete set null,
  user_name text not null,
  product_id bigint references public.products(id) on delete set null,
  product_name text not null,
  manufacturer text,
  unit_price numeric(10, 2) not null,
  quantity integer not null check (quantity > 0),
  unit text not null default 'Strips',
  note text,
  status text not null default 'pending' check (status in ('onboarding', 'pending', 'approved', 'rejected', 'completed')),
  submitted_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_orders_user_id on public.orders (user_id);
create index if not exists idx_orders_status on public.orders (status);

-- ==============================================================================
-- 5. AUTOMATIC PROFILE CREATION TRIGGER (When a user signs up via Supabase Auth)
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
declare
  is_admin boolean;
begin
  -- Check if user email belongs to predefined NET PLUS admin list
  is_admin := (new.email in ('admin@netplusenterprises.com', 'manager@netplusenterprises.com'));

  insert into public.cust_detail (
    id,
    email,
    role,
    status,
    store_name,
    store_type,
    licence_no,
    gstin,
    store_address,
    city,
    state,
    pincode,
    owner_name,
    phone,
    alternate_phone,
    licence_file_url,
    licence_file_name,
    shop_photo_url,
    shop_photo_name
  ) values (
    new.id,
    new.email,
    case when is_admin then 'admin' else coalesce(new.raw_user_meta_data->>'role', 'retailer') end,
    case when is_admin then 'approved' else coalesce(new.raw_user_meta_data->>'status', 'onboarding') end,
    coalesce(new.raw_user_meta_data->>'store_name', new.raw_user_meta_data->>'storeName', case when is_admin then 'NET PLUS HQ' else 'New Medical Shop' end),
    new.raw_user_meta_data->>'store_type',
    new.raw_user_meta_data->>'licence_no',
    new.raw_user_meta_data->>'gstin',
    new.raw_user_meta_data->>'store_address',
    new.raw_user_meta_data->>'city',
    coalesce(new.raw_user_meta_data->>'state', 'Maharashtra'),
    new.raw_user_meta_data->>'pincode',
    coalesce(new.raw_user_meta_data->>'owner_name', new.raw_user_meta_data->>'ownerName', case when is_admin then 'Administrator' else 'Shop Owner' end),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'alternate_phone',
    new.raw_user_meta_data->>'licence_file_url',
    new.raw_user_meta_data->>'licence_file_name',
    new.raw_user_meta_data->>'shop_photo_url',
    new.raw_user_meta_data->>'shop_photo_name'
  )
  on conflict (id) do update set
    updated_at = timezone('utc'::text, now());

  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
alter table public.cust_detail enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;

-- Helper function to check if the caller is an admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.cust_detail
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Relax foreign key so cust_detail can be created directly by registration portal
alter table public.cust_detail drop constraint if exists cust_detail_id_fkey;
alter table public.cust_detail alter column id set default gen_random_uuid();

-- --- CUST_DETAIL POLICIES ---
drop policy if exists "Users and Admins can view cust_detail" on public.cust_detail;
drop policy if exists "Allow read cust_detail" on public.cust_detail;
create policy "Allow read cust_detail"
  on public.cust_detail for select
  using (true);

drop policy if exists "Users and Admins can update cust_detail" on public.cust_detail;
drop policy if exists "Allow update cust_detail" on public.cust_detail;
create policy "Allow update cust_detail"
  on public.cust_detail for update
  using (true);

drop policy if exists "Enable insert for authenticated users and triggers" on public.cust_detail;
drop policy if exists "Allow insert cust_detail" on public.cust_detail;
create policy "Allow insert cust_detail"
  on public.cust_detail for insert
  with check (true);

drop policy if exists "Admins can delete cust_detail" on public.cust_detail;
drop policy if exists "Allow delete cust_detail" on public.cust_detail;
create policy "Allow delete cust_detail"
  on public.cust_detail for delete
  using (true);

-- --- PRODUCTS POLICIES ---
drop policy if exists "Anyone can view products" on public.products;
create policy "Anyone can view products"
  on public.products for select
  to public
  using (true);

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
  on public.products for insert
  with check (true);

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
  on public.products for update
  using (true);

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
  on public.products for delete
  using (true);

-- --- ORDERS POLICIES ---
drop policy if exists "View orders policy" on public.orders;
drop policy if exists "Allow read orders" on public.orders;
create policy "Allow read orders"
  on public.orders for select
  using (true);

drop policy if exists "Retailers can insert orders" on public.orders;
drop policy if exists "Allow insert orders" on public.orders;
create policy "Allow insert orders"
  on public.orders for insert
  with check (true);

drop policy if exists "Admins can update orders" on public.orders;
drop policy if exists "Allow update orders" on public.orders;
create policy "Allow update orders"
  on public.orders for update
  using (true);

-- ==============================================================================
-- 7. STORAGE BUCKET: retailer-documents
-- ==============================================================================
insert into storage.buckets (id, name, public)
values ('retailer-documents', 'retailer-documents', true)
on conflict (id) do nothing;

drop policy if exists "Authenticated users can upload retailer documents" on storage.objects;
drop policy if exists "Allow upload retailer documents" on storage.objects;
create policy "Allow upload retailer documents"
  on storage.objects for insert
  to public
  with check (bucket_id = 'retailer-documents');

drop policy if exists "Public read for retailer documents" on storage.objects;
create policy "Public read for retailer documents"
  on storage.objects for select
  to public
  using (bucket_id = 'retailer-documents');

-- ==============================================================================
-- 8. SEED DATA: 20 Essential Products
-- ==============================================================================
insert into public.products (id, name, generic, manufacturer, category, price, mrp, unit, stock, rx) values
  (1,  'Augmentin 625mg',     'Amoxicillin + Clavulanic Acid', 'Pfizer',               'antibiotics',    285.50, 350.00, 'Strip/10',    450, true),
  (2,  'Azithral 500mg',      'Azithromycin',                  'Alembic Pharma',       'antibiotics',    98.20,  125.00, 'Strip/5',     890, true),
  (3,  'Metformin 500mg SR',  'Metformin HCl',                 'Sun Pharma',           'diabetes',       45.80,  62.00,  'Strip/15',    1200,true),
  (4,  'Amlodipine 5mg',      'Amlodipine Besylate',           'Cipla',                'cardiovascular', 38.50,  55.00,  'Strip/15',    680, true),
  (5,  'Dolo 650mg',          'Paracetamol',                   'Mankind Pharma',       'pain',           28.90,  38.00,  'Strip/15',    2500,false),
  (6,  'Pantoprazole 40mg',   'Pantoprazole Sodium',           'Alembic Pharma',       'gastro',         52.40,  72.00,  'Strip/15',    980, true),
  (7,  'Becosules Capsules',  'Multivitamin + Minerals',       'Pfizer',               'vitamins',       112.00, 148.00, 'Bottle/20',   760, false),
  (8,  'Telmisartan 40mg',    'Telmisartan',                   'Dr. Reddy''s',         'cardiovascular', 88.30,  118.00, 'Strip/14',    540, true),
  (9,  'Cetirizine 10mg',     'Cetirizine HCl',                'Cipla',                'respiratory',    22.50,  32.00,  'Strip/10',    1800,false),
  (10, 'Atorvastatin 10mg',   'Atorvastatin Calcium',          'Lupin',                'cardiovascular', 66.70,  92.00,  'Strip/15',    720, true),
  (11, 'Amitriptyline 25mg',  'Amitriptyline HCl',             'Sun Pharma',           'neuro',          44.20,  62.00,  'Strip/10',    390, true),
  (12, 'Calamine Lotion',     'Calamine + Zinc Oxide',         'Dr. Reddy''s',         'derma',          68.00,  95.00,  'Bottle/100ml',320, false),
  (13, 'Salbutamol Inhaler',  'Salbutamol Sulphate',           'Cipla',                'respiratory',    145.00, 195.00, '200 doses',   280, true),
  (14, 'Ondansetron 4mg',     'Ondansetron HCl',               'Abbott India',         'gastro',         36.80,  52.00,  'Strip/10',    640, true),
  (15, 'Glimepiride 2mg',     'Glimepiride',                  'Abbott India',         'diabetes',       78.50,  108.00, 'Strip/15',    490, true),
  (16, 'Surgical Gloves',     'Latex Sterile Gloves',          'Hindustan Syr.',       'surgical',       320.00, 450.00, 'Box/100',     180, false),
  (17, 'Clonazepam 0.5mg',    'Clonazepam',                    'Torrent Pharma',       'neuro',          62.00,  88.00,  'Strip/10',    340, true),
  (18, 'Esomeprazole 40mg',   'Esomeprazole Magnesium',        'Lupin',                'gastro',         74.00,  105.00, 'Strip/14',    580, true),
  (19, 'Vitamin D3 60K',      'Cholecalciferol 60000 IU',      'Mankind Pharma',       'vitamins',       44.00,  65.00,  'Strip/4 caps',1100,false),
  (20, 'Betamethasone Cream', 'Betamethasone Valerate',        'Zydus Lifesciences',   'derma',          56.00,  82.00,  'Tube/15g',    260, true)
on conflict (id) do update set
  name = excluded.name,
  price = excluded.price,
  mrp = excluded.mrp,
  stock = excluded.stock;

-- Reset sequence to avoid id conflicts on future inserts
select setval(pg_get_serial_sequence('public.products', 'id'), coalesce(max(id), 1)) from public.products;

-- ==============================================================================
-- 9. SEED DATA: Admin and Dummy Users
-- ==============================================================================
-- Note: This requires the pgcrypto extension to hash passwords.
create extension if not exists pgcrypto;

-- 1. Insert Admin User
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '00000000-0000-0000-0000-000000000000', 'a1111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'admin@netplusenterprises.com', crypt('Admin@2024', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"admin", "status":"approved", "name":"System Admin"}', now(), now()
) on conflict (id) do nothing;

-- 2. Insert Dummy Retailer 1
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '00000000-0000-0000-0000-000000000000', 'b2222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'retailer1@example.com', crypt('Retailer@123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"retailer", "status":"approved", "store_name":"Apollo Pharmacy", "city":"Mumbai", "phone":"9876543210"}', now(), now()
) on conflict (id) do nothing;

-- 3. Insert Dummy Retailer 2
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '00000000-0000-0000-0000-000000000000', 'c3333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'retailer2@example.com', crypt('Retailer@123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"retailer", "status":"pending", "store_name":"Wellness Forever", "city":"Pune", "phone":"9123456780"}', now(), now()
) on conflict (id) do nothing;

-- The trigger "handle_new_user" will automatically copy these users into the public.cust_detail table!

-- ==============================================================================
-- 10. SEED DATA: public.users (For manual tracking if needed)
-- ==============================================================================
insert into public.users (id, name, email, password, role, status)
values 
  ('a1111111-1111-1111-1111-111111111111', 'System Admin', 'admin@netplusenterprises.com', 'Admin@2024', 'admin', 'approved'),
  ('b2222222-2222-2222-2222-222222222222', 'Retailer 1', 'retailer1@example.com', 'Retailer@123', 'retailer', 'approved'),
  ('c3333333-3333-3333-3333-333333333333', 'Retailer 2', 'retailer2@example.com', 'Retailer@123', 'retailer', 'pending')
on conflict (id) do nothing;
