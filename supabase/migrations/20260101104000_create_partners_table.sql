/*
  # Create partners table

  1. New Tables
    - `partners`
      - `id` (uuid, primary key)
      - `name` (text, unique, not null) - Internal identifier (e.g., 'yassir', 'basim')
      - `display_name` (text, not null) - Display name (e.g., 'Yassir', 'Basim')
      - `is_active` (boolean, default true) - Whether partner is active
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Initial Data
    - Insert Yassir and Basim as partners

  3. Indexes
    - Index on name for fast lookups
*/

CREATE TABLE IF NOT EXISTS partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_partners_name ON partners(name);
CREATE INDEX IF NOT EXISTS idx_partners_active ON partners(is_active);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_partners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_partners_timestamp
  BEFORE UPDATE ON partners
  FOR EACH ROW
  EXECUTE FUNCTION update_partners_updated_at();

-- Insert initial partners (Yassir and Basim)
INSERT INTO partners (name, display_name) VALUES
  ('yassir', 'Yassir'),
  ('basim', 'Basim')
ON CONFLICT (name) DO NOTHING;
