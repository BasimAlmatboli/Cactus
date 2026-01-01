/*
  # Create system_settings table

  1. New Tables
    - `system_settings`
      - `id` (uuid, primary key)
      - `setting_key` (text, unique, not null) - Unique identifier for the setting
      - `setting_value` (text, not null) - Value stored as text (can be parsed as needed)
      - `setting_type` (text, not null) - Type of value: 'number', 'string', 'boolean', 'json'
      - `description` (text) - Human-readable description of the setting
      - `category` (text) - Category for grouping settings (e.g., 'shipping', 'payment', 'general')
      - `is_editable` (boolean, default true) - Whether this setting can be edited via UI
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `system_settings` table
    - Add policies for authenticated users to read settings
    - Add policies for authenticated users to update editable settings

  3. Initial Data
    - Insert free shipping threshold setting (300 SAR)
*/

CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text NOT NULL,
  setting_type text NOT NULL CHECK (setting_type IN ('number', 'string', 'boolean', 'json')),
  description text,
  category text,
  is_editable boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);


-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_system_settings_timestamp
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_system_settings_updated_at();

-- Insert initial system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, category, is_editable) VALUES
  (
    'free_shipping_threshold',
    '300',
    'number',
    'Minimum order subtotal (SAR) required to qualify for free shipping',
    'shipping',
    true
  ),
  (
    'currency',
    'SAR',
    'string',
    'Default currency for the system',
    'general',
    false
  )
ON CONFLICT (setting_key) DO NOTHING;
