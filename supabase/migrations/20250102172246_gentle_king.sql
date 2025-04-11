/*
  # Add customer name to orders table

  1. Changes
    - Add optional `customer_name` column to `orders` table
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'customer_name'
  ) THEN
    ALTER TABLE orders ADD COLUMN customer_name text;
  END IF;
END $$;