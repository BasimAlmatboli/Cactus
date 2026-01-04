/*
  # Migrate existing profit shares to database

  This migration populates the product_profit_shares table based on the current hardcoded logic:
  
  - Lines RGB Light: Yassir 90%, Basim 10%
  - Mousepad: Yassir 70%, Basim 30%
  - Smart Cube: Yassir 0%, Basim 100%
  - All other products: Yassir 0%, Basim 100%
*/

-- Disable the validation trigger temporarily during migration
ALTER TABLE product_profit_shares DISABLE TRIGGER validate_profit_shares_sum_trigger;

-- Get partner IDs for reference
DO $$
DECLARE
  yassir_id uuid;
  basim_id uuid;
BEGIN
  -- Get partner IDs
  SELECT id INTO yassir_id FROM partners WHERE name = 'yassir';
  SELECT id INTO basim_id FROM partners WHERE name = 'basim';

  -- Lines RGB Light: Yassir 90%, Basim 10%
  INSERT INTO product_profit_shares (product_id, partner_id, share_percentage)
  SELECT 
    p.id,
    yassir_id,
    90
  FROM products p
  WHERE p.name = 'Lines RGB Light'
  ON CONFLICT (product_id, partner_id) DO NOTHING;

  INSERT INTO product_profit_shares (product_id, partner_id, share_percentage)
  SELECT 
    p.id,
    basim_id,
    10
  FROM products p
  WHERE p.name = 'Lines RGB Light'
  ON CONFLICT (product_id, partner_id) DO NOTHING;

  -- Mousepad: Yassir 70%, Basim 30%
  INSERT INTO product_profit_shares (product_id, partner_id, share_percentage)
  SELECT 
    p.id,
    yassir_id,
    70
  FROM products p
  WHERE p.name = 'Mousepad'
  ON CONFLICT (product_id, partner_id) DO NOTHING;

  INSERT INTO product_profit_shares (product_id, partner_id, share_percentage)
  SELECT 
    p.id,
    basim_id,
    30
  FROM products p
  WHERE p.name = 'Mousepad'
  ON CONFLICT (product_id, partner_id) DO NOTHING;

  -- Smart Cube: Yassir 0%, Basim 100%
  INSERT INTO product_profit_shares (product_id, partner_id, share_percentage)
  SELECT 
    p.id,
    yassir_id,
    0
  FROM products p
  WHERE p.name = 'Smart Cube'
  ON CONFLICT (product_id, partner_id) DO NOTHING;

  INSERT INTO product_profit_shares (product_id, partner_id, share_percentage)
  SELECT 
    p.id,
    basim_id,
    100
  FROM products p
  WHERE p.name = 'Smart Cube'
  ON CONFLICT (product_id, partner_id) DO NOTHING;

  -- All other products: Yassir 0%, Basim 100%
  INSERT INTO product_profit_shares (product_id, partner_id, share_percentage)
  SELECT 
    p.id,
    yassir_id,
    0
  FROM products p
  WHERE p.name NOT IN ('Lines RGB Light', 'Mousepad', 'Smart Cube')
  ON CONFLICT (product_id, partner_id) DO NOTHING;

  INSERT INTO product_profit_shares (product_id, partner_id, share_percentage)
  SELECT 
    p.id,
    basim_id,
    100
  FROM products p
  WHERE p.name NOT IN ('Lines RGB Light', 'Mousepad', 'Smart Cube')
  ON CONFLICT (product_id, partner_id) DO NOTHING;

END $$;

-- Re-enable the validation trigger
ALTER TABLE product_profit_shares ENABLE TRIGGER validate_profit_shares_sum_trigger;

-- Verify migration
DO $$
DECLARE
  product_count integer;
  share_count integer;
  invalid_products text;
BEGIN
  SELECT COUNT(*) INTO product_count FROM products WHERE is_active = true;
  SELECT COUNT(DISTINCT product_id) INTO share_count FROM product_profit_shares;
  
  RAISE NOTICE 'Migration complete:';
  RAISE NOTICE '  Active products: %', product_count;
  RAISE NOTICE '  Products with profit shares: %', share_count;
  
  IF product_count != share_count THEN
    RAISE WARNING 'Not all products have profit shares configured!';
  END IF;
  
  -- Check for products where shares don't sum to 100%
  SELECT string_agg(p.name, ', ') INTO invalid_products
  FROM products p
  WHERE (
    SELECT COALESCE(SUM(share_percentage), 0)
    FROM product_profit_shares pps
    WHERE pps.product_id = p.id
  ) != 100;
  
  IF invalid_products IS NOT NULL THEN
    RAISE WARNING 'Products with invalid profit shares (not 100%%): %', invalid_products;
  ELSE
    RAISE NOTICE '  All products have valid profit shares (sum to 100%%)';
  END IF;
END $$;

