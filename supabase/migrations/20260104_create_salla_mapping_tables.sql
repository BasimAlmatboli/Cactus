/*
  # Create Salla Import Mapping Tables
  
  This migration creates three mapping tables to handle imports from Salla platform:
  1. salla_product_mappings - Maps Salla product names/SKUs to system products
  2. salla_shipping_mappings - Maps Salla shipping company names to system shipping methods
  3. salla_payment_mappings - Maps Salla payment method names to system payment methods
*/

-- ================================
-- Table 1: Product Mappings
-- ================================
CREATE TABLE IF NOT EXISTS salla_product_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salla_product_name text NOT NULL UNIQUE,
  salla_sku text,
  system_product_id text NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for fast lookups during import
CREATE INDEX IF NOT EXISTS idx_salla_product_mappings_name ON salla_product_mappings(salla_product_name);
CREATE INDEX IF NOT EXISTS idx_salla_product_mappings_sku ON salla_product_mappings(salla_sku) WHERE salla_sku IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_salla_product_mappings_system_id ON salla_product_mappings(system_product_id);

-- Comments
COMMENT ON TABLE salla_product_mappings IS 'Maps Salla product names and SKUs to system products for import processing';
COMMENT ON COLUMN salla_product_mappings.salla_product_name IS 'Exact product name from Salla CSV (e.g., "ماوس باد بطابع عربي - Arabian Mousepad")';
COMMENT ON COLUMN salla_product_mappings.salla_sku IS 'SKU from Salla CSV (optional)';
COMMENT ON COLUMN salla_product_mappings.system_product_id IS 'Reference to products.id in the system';

-- ================================
-- Table 2: Shipping Mappings
-- ================================
CREATE TABLE IF NOT EXISTS salla_shipping_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salla_shipping_name text NOT NULL UNIQUE,
  system_shipping_method_id uuid NOT NULL REFERENCES shipping_methods(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_salla_shipping_mappings_name ON salla_shipping_mappings(salla_shipping_name);

-- Comments
COMMENT ON TABLE salla_shipping_mappings IS 'Maps Salla shipping company names to system shipping methods';
COMMENT ON COLUMN salla_shipping_mappings.salla_shipping_name IS 'Shipping company name from Salla CSV (e.g., ''سمسا'', ''ريدبوكس'')';
COMMENT ON COLUMN salla_shipping_mappings.system_shipping_method_id IS 'Reference to shipping_methods.id in the system';

-- Insert default shipping mappings
-- Use subqueries to get actual UUIDs from shipping_methods table
INSERT INTO salla_shipping_mappings (salla_shipping_name, system_shipping_method_id)
SELECT '''سمسا''', id FROM shipping_methods WHERE name = 'SMSA'
UNION ALL
SELECT '''ريدبوكس''', id FROM shipping_methods WHERE name = 'Redbox'
UNION ALL
SELECT 'SMSA-Eco', id FROM shipping_methods WHERE name = 'SMSA-Eco'
ON CONFLICT (salla_shipping_name) DO NOTHING;

-- ================================
-- Table 3: Payment Mappings
-- ================================
CREATE TABLE IF NOT EXISTS salla_payment_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salla_payment_name text NOT NULL UNIQUE,
  system_payment_method_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_salla_payment_mappings_name ON salla_payment_mappings(salla_payment_name);

-- Comments
COMMENT ON TABLE salla_payment_mappings IS 'Maps Salla payment method names to system payment methods';
COMMENT ON COLUMN salla_payment_mappings.salla_payment_name IS 'Payment method name from Salla CSV (e.g., "مدى", "تمارا")';
COMMENT ON COLUMN salla_payment_mappings.system_payment_method_id IS 'System payment method ID (mada, visa, tamara)';

-- Insert default payment mappings
INSERT INTO salla_payment_mappings (salla_payment_name, system_payment_method_id) VALUES
  ('مدى', 'mada'),
  ('تمارا', 'tamara'),
  ('البطاقة الإئتمانية', 'visa')
ON CONFLICT (salla_payment_name) DO NOTHING;

-- ================================
-- Trigger: Update updated_at timestamp
-- ================================
CREATE OR REPLACE FUNCTION update_salla_product_mappings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_salla_product_mappings_updated_at
  BEFORE UPDATE ON salla_product_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_salla_product_mappings_updated_at();
