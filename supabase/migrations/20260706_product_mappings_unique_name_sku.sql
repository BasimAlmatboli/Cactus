/*
  # Allow multiple product mappings per Salla product name (one per SKU)

  Problem: salla_product_mappings.salla_product_name had a UNIQUE constraint,
  so a product with multiple size variants (same name, different SKU, e.g.
  "اضاءة الشاشة التفاعلية" with TV-LIGHT-24 ... TV-LIGHT-75-85) could only
  have one mapping.

  Fix: uniqueness is now on (name, SKU). A NULL SKU is treated as '' so you
  still can't create two SKU-less mappings for the same name.
*/

-- 1. Drop the name-only unique constraint (default auto-generated name)
ALTER TABLE salla_product_mappings
  DROP CONSTRAINT IF EXISTS salla_product_mappings_salla_product_name_key;

-- 2. Enforce uniqueness on name + SKU instead (NULL SKU counts as '')
CREATE UNIQUE INDEX IF NOT EXISTS idx_salla_product_mappings_name_sku_unique
  ON salla_product_mappings (salla_product_name, COALESCE(salla_sku, ''));

COMMENT ON COLUMN salla_product_mappings.salla_product_name IS
  'Exact product name from Salla CSV. May repeat across rows when the product has multiple SKUs/sizes.';
