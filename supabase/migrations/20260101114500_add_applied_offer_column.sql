/*
  # Add applied_offer column to orders table
  
  This migration adds the applied_offer column to store offer information for orders.
*/

-- Add applied_offer column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS applied_offer jsonb;

-- Add comment
COMMENT ON COLUMN orders.applied_offer IS 'Stores applied offer details (offer_id, offer_name, target_product_id, discount_amount)';
