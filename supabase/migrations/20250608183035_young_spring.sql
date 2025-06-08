/*
  # Add SKU field to products and orders

  1. Changes
    - Add `sku` column to products in orders items
    - Update existing data structure to support SKU
    - This migration handles the JSON structure in orders table
*/

-- Note: Since products are stored as JSON in the orders table,
-- we don't need to alter the table structure directly.
-- The SKU will be included in the product JSON objects.

-- This migration serves as documentation for the SKU addition
-- The actual implementation will be handled in the application code