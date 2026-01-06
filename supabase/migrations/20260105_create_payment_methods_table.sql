-- Create payment_methods table
CREATE TABLE payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  fee_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0,
  fee_fixed DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 15,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on display_order for efficient sorting
CREATE INDEX idx_payment_methods_display_order ON payment_methods(display_order);

-- Create index on is_active for filtering
CREATE INDEX idx_payment_methods_is_active ON payment_methods(is_active);

-- Seed initial payment methods (mada, visa, tamara)
INSERT INTO payment_methods (name, fee_percentage, fee_fixed, tax_rate, display_order) VALUES
('MADA', 1.0, 1.0, 15.0, 1),
('Visa', 2.2, 1.0, 15.0, 2),
('Tamara', 7.0, 1.5, 15.0, 3);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_payment_methods_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_methods_updated_at();
