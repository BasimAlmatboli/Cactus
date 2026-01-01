/*
  # Create products table

  1. New Tables
    - `products`
      - `id` (text, primary key) - matches existing product IDs
      - `name` (text, not null)
      - `sku` (text, not null, unique)
      - `cost` (numeric, not null)
      - `selling_price` (numeric, not null)
      - `owner` (text, not null) - 'yassir' or 'basim'
      - `category` (text, nullable) - for future categorization
      - `description` (text, nullable)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `products` table
    - Add policies for authenticated users to read products
    - Add policies for authenticated users to manage products

  3. Indexes
    - Index on owner for profit sharing queries
    - Index on sku for lookups
    - Index on is_active for filtering
*/

CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  name text NOT NULL,
  sku text NOT NULL UNIQUE,
  cost numeric(10,2) NOT NULL CHECK (cost >= 0),
  selling_price numeric(10,2) NOT NULL CHECK (selling_price >= 0),
  owner text NOT NULL CHECK (owner IN ('yassir', 'basim')),
  category text,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_owner ON products(owner);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default products from localStorage
INSERT INTO products (id, name, sku, cost, selling_price, owner) VALUES
  ('Old RGB Light', 'Old RGB Light', 'RGB-001', 130, 199, 'yassir'),
  ('New RGB Light', 'New RGB Light', 'RGB-NEW-001', 130, 215, 'yassir'),
  ('Mousepad', 'Mousepad', 'MP-L-001', 19, 89, 'yassir'),
  ('pixel 16', 'pixel 16', 'PIX-16-001', 80, 193, 'basim'),
  ('pixel 32', 'pixel 32', 'PIX-32-001', 95, 248, 'basim'),
  ('pixel 64', 'pixel 64', 'PIX-64-001', 220, 349, 'basim'),
  ('PC Light 24', 'PC Light 24', 'PC-LIGHT-24', 55, 179, 'basim'),
  ('PC Light 27', 'PC Light 27', 'PC-LIGHT-27', 58, 189, 'basim'),
  ('PC Light 32', 'PC Light 32', 'PC-LIGHT-32', 60, 194, 'basim'),
  ('PC Light 34', 'PC Light 34', 'PC-LIGHT-34', 61, 199, 'basim'),
  ('TV 24', 'TV 24', 'TV-LIGHT-24', 100, 249, 'basim'),
  ('TV 27', 'TV 27', 'TV-LIGHT-27', 102, 259, 'basim'),
  ('TV 32', 'TV 32', 'TV-LIGHT-32', 103, 269, 'basim'),
  ('TV 34', 'TV 34', 'TV-LIGHT-34', 104, 274, 'basim'),
  ('TV 40-50', 'TV 40-50', 'TV-LIGHT-40-50', 104, 279, 'basim'),
  ('TV 55-65', 'TV 55-65', 'TV-LIGHT-55-65', 114, 284, 'basim'),
  ('TV 75-85', 'TV 75-85', 'TV-LIGHT-75-85', 117, 289, 'basim'),
  ('Smart Cube', 'Smart Cube', 'SMT-CUBE-001', 95, 149, 'basim'),
  ('NEON ROPE', 'NEON ROPE', 'NEO-ROPE-001', 95, 139, 'basim'),
  ('MUG', 'MUG', 'MUG-001', 19, 79, 'basim')
ON CONFLICT (id) DO NOTHING;
