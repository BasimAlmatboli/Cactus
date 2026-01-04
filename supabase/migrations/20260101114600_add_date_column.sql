/*
  # Add date column to orders table
  
  This migration adds the date column to store when orders were created.
*/

-- Add date column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS date timestamptz DEFAULT now();

-- Add comment
COMMENT ON COLUMN orders.date IS 'Timestamp when the order was created';

-- Update existing orders to have current timestamp if null
UPDATE orders SET date = now() WHERE date IS NULL;
