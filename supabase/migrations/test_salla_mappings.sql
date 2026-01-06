/*
  Salla Mapping Tables - Test Queries
  
  Run these queries after migration to verify the tables were created correctly
*/

-- ================================
-- 1. Verify Tables Created
-- ================================
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'salla_%_mappings'
ORDER BY table_name;

-- Expected: salla_payment_mappings, salla_product_mappings, salla_shipping_mappings


-- ================================
-- 2. Check Default Shipping Mappings
-- ================================
SELECT 
  salla_shipping_name,
  system_shipping_method_id,
  created_at
FROM salla_shipping_mappings
ORDER BY salla_shipping_name;

-- Expected: 3 rows
-- 'سمسا' -> SMSA
-- 'ريدبوكس' -> REDBOX
-- SMSA-Eco -> SMSA-Eco


-- ================================
-- 3. Check Default Payment Mappings
-- ================================
SELECT 
  salla_payment_name,
  system_payment_method_id,
  created_at
FROM salla_payment_mappings
ORDER BY salla_payment_name;

-- Expected: 3 rows
-- مدى -> mada
-- تمارا -> tamara
-- البطاقة الإئتمانية -> visa


-- ================================
-- 4. Check Product Mappings Table
-- ================================
SELECT COUNT(*) as product_mapping_count
FROM salla_product_mappings;

-- Expected: 0 (empty initially, will be populated via UI)


-- ================================
-- 5. Test Insert Product Mapping
-- ================================
-- Example: Insert a test product mapping
-- (Replace 'YOUR_PRODUCT_ID' with actual product ID from your products table)

-- First, get a sample product ID:
SELECT id, name, sku FROM products LIMIT 1;

-- Then insert a test mapping (use actual product ID from result above):
-- INSERT INTO salla_product_mappings (salla_product_name, salla_sku, system_product_id)
-- VALUES ('ماوس باد بطابع عربي - Arabian Mousepad', 'MP-L-001', 'YOUR_PRODUCT_ID');

-- Verify:
-- SELECT * FROM salla_product_mappings;


-- ================================
-- 6. Test Lookup Query (Simulate Import)
-- ================================
-- This query simulates lookup during import process
WITH salla_order_products AS (
  SELECT 'ماوس باد بطابع عربي - Arabian Mousepad' as product_name, 1 as quantity
  UNION ALL
  SELECT 'Red Sudo Mug - كوب سدو أحمر', 1
)
SELECT 
  sop.product_name,
  sop.quantity,
  spm.system_product_id,
  p.name as system_product_name,
  p.sellingPrice as price,
  (sop.quantity * p.sellingPrice) as line_total
FROM salla_order_products sop
LEFT JOIN salla_product_mappings spm ON sop.product_name = spm.salla_product_name
LEFT JOIN products p ON spm.system_product_id = p.id;

-- Expected: Shows matched products with prices


-- ================================
-- 7. Verify Indexes
-- ================================
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename LIKE 'salla_%_mappings'
ORDER BY tablename, indexname;

-- Expected: Multiple indexes for fast lookups


-- ================================
-- 8. Check Trigger Function
-- ================================
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table = 'salla_product_mappings';

-- Expected: trigger_update_salla_product_mappings_updated_at
