/*
  # Create product_profit_shares table

  1. New Tables
    - `product_profit_shares`
      - `id` (uuid, primary key)
      - `product_id` (uuid, references products) - The product
      - `partner_id` (uuid, references partners) - The partner
      - `share_percentage` (numeric, not null) - Percentage of profit (0-100)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Constraints
    - Unique constraint on (product_id, partner_id) - One share per partner per product
    - Check constraint: share_percentage must be between 0 and 100
    - Foreign key cascades on delete

  3. Indexes
    - Index on product_id for fast lookups
    - Index on partner_id for reporting
*/

CREATE TABLE IF NOT EXISTS product_profit_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  partner_id uuid NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  share_percentage numeric NOT NULL CHECK (share_percentage >= 0 AND share_percentage <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product_id, partner_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_profit_shares_product ON product_profit_shares(product_id);
CREATE INDEX IF NOT EXISTS idx_profit_shares_partner ON product_profit_shares(partner_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_profit_shares_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_profit_shares_timestamp
  BEFORE UPDATE ON product_profit_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_profit_shares_updated_at();

-- Function to validate that profit shares sum to 100% for each product
CREATE OR REPLACE FUNCTION validate_profit_shares_sum()
RETURNS TRIGGER AS $$
DECLARE
  total_percentage numeric;
BEGIN
  -- Calculate total percentage for this product
  SELECT COALESCE(SUM(share_percentage), 0) INTO total_percentage
  FROM product_profit_shares
  WHERE product_id = NEW.product_id
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
  
  -- Add the new/updated percentage
  total_percentage := total_percentage + NEW.share_percentage;
  
  -- Check if total equals 100
  IF total_percentage != 100 THEN
    RAISE EXCEPTION 'Profit shares for product must sum to 100%%. Current total: %', total_percentage;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to validate profit shares sum to 100%
CREATE TRIGGER validate_profit_shares_sum_trigger
  BEFORE INSERT OR UPDATE ON product_profit_shares
  FOR EACH ROW
  EXECUTE FUNCTION validate_profit_shares_sum();
