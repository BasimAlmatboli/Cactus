/*
  # Create offers table for promotional discounts

  ## Overview
  This migration creates the offers table to support promotional discounts where purchasing 
  one product (trigger product) provides a discount on another product (target product).

  ## 1. New Tables
    - `offers`
      - `id` (uuid, primary key) - Unique identifier for each offer
      - `name` (text, not null) - Display name of the offer (e.g., "Buy RGB Light, Get 20% Off Mousepad")
      - `description` (text) - Optional detailed description of the offer
      - `trigger_product_id` (text, not null) - ID of the product that must be purchased to activate the offer
      - `trigger_product_name` (text, not null) - Name of the trigger product (denormalized for historical records)
      - `target_product_id` (text, not null) - ID of the product that receives the discount
      - `target_product_name` (text, not null) - Name of the target product (denormalized for historical records)
      - `discount_type` (text, not null) - Type of discount: 'percentage' or 'fixed'
      - `discount_value` (numeric, not null) - Value of the discount (percentage 0-100 or fixed amount)
      - `is_active` (boolean, not null, default true) - Whether the offer is currently active
      - `start_date` (date) - Optional start date for the offer validity period
      - `end_date` (date) - Optional end date for the offer validity period
      - `created_at` (timestamptz, default now()) - Timestamp when the offer was created
      - `updated_at` (timestamptz, default now()) - Timestamp when the offer was last updated

  ## 2. Security
    - Enable RLS on `offers` table
    - Add policies for authenticated users to:
      - SELECT: View all offers
      - INSERT: Create new offers
      - UPDATE: Modify existing offers
      - DELETE: Remove offers

  ## 3. Constraints
    - Discount type must be either 'percentage' or 'fixed'
    - Discount value must be positive
    - For percentage discounts, value must be between 0 and 100
    - End date must be after start date (if both are specified)

  ## 4. Important Notes
    - Product names are denormalized to maintain historical accuracy even if products are renamed
    - Offers can be made inactive without deletion to preserve historical records
    - When an offer is applied to an order, the offer details should be stored in the order record
*/

CREATE TABLE IF NOT EXISTS offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  trigger_product_id text NOT NULL,
  trigger_product_name text NOT NULL,
  target_product_id text NOT NULL,
  target_product_name text NOT NULL,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL CHECK (discount_value > 0),
  is_active boolean NOT NULL DEFAULT true,
  start_date date,
  end_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_percentage CHECK (
    discount_type != 'percentage' OR (discount_value >= 0 AND discount_value <= 100)
  ),
  CONSTRAINT valid_date_range CHECK (
    (start_date IS NULL OR end_date IS NULL) OR (end_date >= start_date)
  )
);

ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all offers"
  ON offers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create offers"
  ON offers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update offers"
  ON offers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete offers"
  ON offers
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_offers_active ON offers(is_active);
CREATE INDEX IF NOT EXISTS idx_offers_dates ON offers(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_offers_trigger_product ON offers(trigger_product_id);
CREATE INDEX IF NOT EXISTS idx_offers_target_product ON offers(target_product_id);