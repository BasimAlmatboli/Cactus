-- Create the quick_discounts table
CREATE TABLE quick_discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value NUMERIC(10, 2) NOT NULL CHECK (value >= 0),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient ordering queries
CREATE INDEX idx_quick_discounts_order ON quick_discounts(display_order, is_active);

-- RLS policies
ALTER TABLE quick_discounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quick discounts are viewable by everyone"
  ON quick_discounts FOR SELECT
  USING (true);

CREATE POLICY "Quick discounts are insertable by authenticated users"
  ON quick_discounts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Quick discounts are updatable by authenticated users"
  ON quick_discounts FOR UPDATE
  USING (true);

CREATE POLICY "Quick discounts are deletable by authenticated users"
  ON quick_discounts FOR DELETE
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_quick_discounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quick_discounts_updated_at
  BEFORE UPDATE ON quick_discounts
  FOR EACH ROW
  EXECUTE FUNCTION update_quick_discounts_updated_at();

-- Seed with the previously hardcoded discounts
INSERT INTO quick_discounts (name, type, value, display_order, is_active) VALUES
  ('10% Off', 'percentage', 10, 1, true),
  ('15% Off', 'percentage', 15, 2, true),
  ('20% Off', 'percentage', 20, 3, true),
  ('39.5 SAR Off', 'fixed', 39.5, 4, true),
  ('79 SAR Off', 'fixed', 79, 5, true);
