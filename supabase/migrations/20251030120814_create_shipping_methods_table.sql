/*
  # Create shipping_methods table

  1. New Tables
    - `shipping_methods`
      - `id` (uuid, primary key)
      - `name` (text, not null, unique)
      - `cost` (numeric, not null)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  3. Initial Data
    - Populate table with default shipping methods (Redbox, SMSA-Eco, SMSA)
*/

CREATE TABLE IF NOT EXISTS shipping_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  cost numeric NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);


-- Insert default shipping methods
INSERT INTO shipping_methods (name, cost) VALUES
  ('Redbox', 15),
  ('SMSA-Eco', 20),
  ('SMSA', 30)
ON CONFLICT (name) DO NOTHING;