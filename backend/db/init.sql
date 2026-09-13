-- ==============================================================================
--   NET PLUS — PostgreSQL Database Setup (Run in PgAdmin)
--   
--   Step 1: Create the database 'netplus' using PgAdmin GUI or run:
--           CREATE DATABASE netplus;
--   Step 2: Connect to 'netplus' database, then run this script.
-- ==============================================================================

-- Enable UUID support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- USERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'retailer' CHECK (role IN ('admin', 'retailer')),
  status TEXT NOT NULL DEFAULT 'onboarding' CHECK (status IN ('onboarding', 'pending', 'approved', 'rejected', 'completed')),

  -- Store Details
  store_name TEXT,
  store_type TEXT,
  licence_no TEXT,
  gstin TEXT,
  store_address TEXT,
  city TEXT,
  state TEXT DEFAULT 'Maharashtra',
  pincode TEXT,

  -- Owner Details
  owner_name TEXT,
  phone TEXT,
  alternate_phone TEXT,

  -- Uploaded Documents
  licence_file_name TEXT,
  licence_file_url TEXT,
  shop_photo_name TEXT,
  shop_photo_url TEXT,

  -- Authentication
  reset_otp TEXT,
  reset_otp_expiry TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

-- ==============================================================================
-- PRODUCTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  generic TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  mrp NUMERIC(10, 2) NOT NULL CHECK (mrp >= 0),
  tax_included BOOLEAN NOT NULL DEFAULT TRUE,
  tax_percent NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (tax_percent >= 0 AND tax_percent <= 100),
  unit TEXT NOT NULL DEFAULT 'Strip/10',
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  rx BOOLEAN NOT NULL DEFAULT FALSE,
  image_url TEXT,
  pricing JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_name ON products (name);

-- ==============================================================================
-- ORDERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  note TEXT DEFAULT '',
  discount_code TEXT,
  discount_amount NUMERIC(10, 2) DEFAULT 0,
  total_amount NUMERIC(10, 2),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'delivered', 'cancelled', 'returned', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders (order_id);

-- ==============================================================================
-- COUPONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS coupons (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_percentage NUMERIC(5, 2) NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_visible BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons (code);

-- ==============================================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_coupons_updated_at ON coupons;
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- SEED: Admin Users
-- ==============================================================================
INSERT INTO users (name, email, password, role, status, store_name, owner_name) VALUES
(
  'System Admin',
  'admin@netplusenterprises.com',
  crypt('Admin@2025', gen_salt('bf')),
  'admin',
  'approved',
  'NETPLUS DHN',
  'Administrator'
),
(
  'NETPLUS HR',
  'netplusenterprises@gmail.com',
  crypt('Admin@2025', gen_salt('bf')),
  'admin',
  'approved',
  'NETPLUS HR',
  'Administrator 2'
),
(
  'System Admin 3',
  'netplusenterprisesdhn@gmail.com',
  crypt('Admin@2025', gen_salt('bf')),
  'admin',
  'approved',
  'NETPLUS DHN',
  'Administrator 3'
)
ON CONFLICT (email) DO UPDATE SET 
  password = EXCLUDED.password, 
  role = 'admin',
  status = 'approved';

-- ==============================================================================
-- SEED: 20 Products
-- ==============================================================================
INSERT INTO products (name, generic, manufacturer, category, price, mrp, unit, stock, rx) VALUES
  ('Augmentin 625mg',     'Amoxicillin + Clavulanic Acid', 'Pfizer',               'antibiotics',    285.50, 350.00, 'Strip/10',     450,  true),
  ('Azithral 500mg',      'Azithromycin',                  'Alembic Pharma',        'antibiotics',    98.20,  125.00, 'Strip/5',      890,  true),
  ('Metformin 500mg SR',  'Metformin HCl',                 'Sun Pharma',            'diabetes',       45.80,  62.00,  'Strip/15',     1200, true),
  ('Amlodipine 5mg',      'Amlodipine Besylate',           'Cipla',                 'cardiovascular', 38.50,  55.00,  'Strip/15',     680,  true),
  ('Dolo 650mg',          'Paracetamol',                   'Mankind Pharma',        'pain',           28.90,  38.00,  'Strip/15',     2500, false),
  ('Pantoprazole 40mg',   'Pantoprazole Sodium',           'Alembic Pharma',        'gastro',         52.40,  72.00,  'Strip/15',     980,  true),
  ('Becosules Capsules',  'Multivitamin + Minerals',       'Pfizer',                'vitamins',       112.00, 148.00, 'Bottle/20',    760,  false),
  ('Telmisartan 40mg',    'Telmisartan',                   'Dr. Reddy''s',          'cardiovascular', 88.30,  118.00, 'Strip/14',     540,  true),
  ('Cetirizine 10mg',     'Cetirizine HCl',                'Cipla',                 'respiratory',    22.50,  32.00,  'Strip/10',     1800, false),
  ('Atorvastatin 10mg',   'Atorvastatin Calcium',          'Lupin',                 'cardiovascular', 66.70,  92.00,  'Strip/15',     720,  true),
  ('Amitriptyline 25mg',  'Amitriptyline HCl',             'Sun Pharma',            'neuro',          44.20,  62.00,  'Strip/10',     390,  true),
  ('Calamine Lotion',     'Calamine + Zinc Oxide',         'Dr. Reddy''s',          'derma',          68.00,  95.00,  'Bottle/100ml', 320,  false),
  ('Salbutamol Inhaler',  'Salbutamol Sulphate',           'Cipla',                 'respiratory',    145.00, 195.00, '200 doses',    280,  true),
  ('Ondansetron 4mg',     'Ondansetron HCl',               'Abbott India',          'gastro',         36.80,  52.00,  'Strip/10',     640,  true),
  ('Glimepiride 2mg',     'Glimepiride',                   'Abbott India',          'diabetes',       78.50,  108.00, 'Strip/15',     490,  true),
  ('Surgical Gloves',     'Latex Sterile Gloves',          'Hindustan Syr.',        'surgical',       320.00, 450.00, 'Box/100',      180,  false),
  ('Clonazepam 0.5mg',    'Clonazepam',                    'Torrent Pharma',        'neuro',          62.00,  88.00,  'Strip/10',     340,  true),
  ('Esomeprazole 40mg',   'Esomeprazole Magnesium',        'Lupin',                 'gastro',         74.00,  105.00, 'Strip/14',     580,  true),
  ('Vitamin D3 60K',      'Cholecalciferol 60000 IU',      'Mankind Pharma',        'vitamins',       44.00,  65.00,  'Strip/4 caps', 1100, false),
  ('Betamethasone Cream', 'Betamethasone Valerate',        'Zydus Lifesciences',    'derma',          56.00,  82.00,  'Tube/15g',     260,  true)
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- SEED: Coupons
-- ==============================================================================
INSERT INTO coupons (code, discount_percentage, is_active, is_visible) VALUES
  ('WELCOME10', 10.00, true, true),
  ('FESTIVE20', 20.00, true, true),
  ('BULK5', 5.00, true, true)
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- DONE! Verify with: SELECT count(*) FROM products;
-- ==============================================================================
-- Create the cust_details table
CREATE TABLE IF NOT EXISTS cust_details (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  store_name VARCHAR(255) NOT NULL,
  owner_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(20),
  gstin VARCHAR(50),
  licence_no VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert existing retailers into cust_details (avoiding duplicates)
INSERT INTO cust_details (
  user_id, store_name, owner_name, phone, email, city, state, pincode, gstin, licence_no, created_at
)
SELECT 
  id, store_name, owner_name, phone, email, city, state, pincode, gstin, licence_no, created_at
FROM users
WHERE role = 'retailer' 
AND id NOT IN (SELECT user_id FROM cust_details);
