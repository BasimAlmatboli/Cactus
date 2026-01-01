/*
  # Update profit shares with correct percentages

  This migration updates the product_profit_shares table with the CORRECT percentages:
  
  Product Name          | Yassir % | Basim %
  --------------------- | -------- | -------
  Old RGB Light         | 90%      | 10%
  New RGB Light         | 90%      | 10%
  Mousepad              | 70%      | 30%
  MUG                   | 30%      | 70%
  Smart Cube            | 10%      | 90%
  pixel 16              | 20%      | 80%
  pixel 32              | 20%      | 80%
  pixel 64              | 20%      | 80%
  PC Light 24           | 20%      | 80%
  PC Light 27           | 20%      | 80%
  PC Light 32           | 20%      | 80%
  PC Light 34           | 20%      | 80%
  NEON ROPE             | 20%      | 80%
  TV 24                 | 20%      | 80%
  TV 27                 | 20%      | 80%
  TV 32                 | 20%      | 80%
  TV 34                 | 20%      | 80%
  TV 40-50              | 20%      | 80%
  TV 55-65              | 20%      | 80%
  TV 75-85              | 20%      | 80%
  All Other Items       | 0%       | 100%
*/

-- Disable the validation trigger temporarily
ALTER TABLE product_profit_shares DISABLE TRIGGER validate_profit_shares_sum_trigger;

-- Clear existing profit shares
TRUNCATE TABLE product_profit_shares;

-- Get partner IDs
DO $$
DECLARE
  yassir_id uuid;
  basim_id uuid;
BEGIN
  SELECT id INTO yassir_id FROM partners WHERE name = 'yassir';
  SELECT id INTO basim_id FROM partners WHERE name = 'basim';

  -- Old RGB Light: 90% / 10%
  INSERT INTO product_profit_shares (product_id, partner_id, share_percentage)
  SELECT id, yassir_id, 90 FROM products WHERE name = 'Old RGB Light'
  UNION ALL
  SELECT id, basim_id, 10 FROM products WHERE name = 'Old RGB Light';

  -- New RGB Light: 90% / 10%
  INSERT INTO product_profit_shares (product_id, partner_id, share_percentage)
  SELECT id, yassir_id, 90 FROM products WHERE name = 'New RGB Light'
  UNION ALL
  SELECT id, basim_id, 10 FROM products WHERE name = 'New RGB Light';

  -- Mousepad: 70% / 30%
  INSERT INTO product_profit_shares (product_id, partner_id, share_percentage)
  SELECT id, yassir_id, 70 FROM products WHERE name = 'Mousepad'
  UNION ALL
  SELECT id, basim_id, 30 FROM products WHERE name = 'Mousepad';

  -- MUG: 30% / 70%
  INSERT INTO product_profit_shares (product_id, partner_id, share_percentage)
  SELECT id, yassir_id, 30 FROM products WHERE name = 'MUG'
  UNION ALL
  SELECT id, basim_id, 70 FROM products WHERE name = 'MUG';

  -- Smart Cube: 10% / 90%
  INSERT INTO product_profit_shares (product_id, partner_id, share_percentage)
  SELECT id, yassir_id, 10 FROM products WHERE name = 'Smart Cube'
  UNION ALL
  SELECT id, basim_id, 90 FROM products WHERE name = 'Smart Cube';

  -- All pixel products: 20% / 80%
  INSERT INTO product_profit_shares (product_id, partner_id, share_percentage)
  SELECT id, yassir_id, 20 FROM products WHERE name IN ('pixel 16', 'pixel 32', 'pixel 64')
  UNION ALL
  SELECT id, basim_id, 80 FROM products WHERE name IN ('pixel 16', 'pixel 32', 'pixel 64');

  -- All PC Light products: 20% / 80%
  INSERT INTO product_profit_shares (product_id, partner_id, share_percentage)
  SELECT id, yassir_id, 20 FROM products WHERE name IN ('PC Light 24', 'PC Light 27', 'PC Light 32', 'PC Light 34')
  UNION ALL
  SELECT id, basim_id, 80 FROM products WHERE name IN ('PC Light 24', 'PC Light 27', 'PC Light 32', 'PC Light 34');

  -- NEON ROPE: 20% / 80%
  INSERT INTO product_profit_shares (product_id, partner_id, share_percentage)
  SELECT id, yassir_id, 20 FROM products WHERE name = 'NEON ROPE'
  UNION ALL
  SELECT id, basim_id, 80 FROM products WHERE name = 'NEON ROPE';

  -- All TV products: 20% / 80%
  INSERT INTO product_profit_shares (product_id, partner_id, share_percentage)
  SELECT id, yassir_id, 20 FROM products WHERE name IN ('TV 24', 'TV 27', 'TV 32', 'TV 34', 'TV 40-50', 'TV 55-65', 'TV 75-85')
  UNION ALL
  SELECT id, basim_id, 80 FROM products WHERE name IN ('TV 24', 'TV 27', 'TV 32', 'TV 34', 'TV 40-50', 'TV 55-65', 'TV 75-85');

  -- All other products: 0% / 100%
  INSERT INTO product_profit_shares (product_id, partner_id, share_percentage)
  SELECT p.id, yassir_id, 0 
  FROM products p
  WHERE p.name NOT IN (
    'Old RGB Light', 'New RGB Light', 'Mousepad', 'MUG', 'Smart Cube',
    'pixel 16', 'pixel 32', 'pixel 64',
    'PC Light 24', 'PC Light 27', 'PC Light 32', 'PC Light 34',
    'NEON ROPE',
    'TV 24', 'TV 27', 'TV 32', 'TV 34', 'TV 40-50', 'TV 55-65', 'TV 75-85'
  )
  UNION ALL
  SELECT p.id, basim_id, 100 
  FROM products p
  WHERE p.name NOT IN (
    'Old RGB Light', 'New RGB Light', 'Mousepad', 'MUG', 'Smart Cube',
    'pixel 16', 'pixel 32', 'pixel 64',
    'PC Light 24', 'PC Light 27', 'PC Light 32', 'PC Light 34',
    'NEON ROPE',
    'TV 24', 'TV 27', 'TV 32', 'TV 34', 'TV 40-50', 'TV 55-65', 'TV 75-85'
  );

END $$;

-- Re-enable the validation trigger
ALTER TABLE product_profit_shares ENABLE TRIGGER validate_profit_shares_sum_trigger;

-- Verify migration
DO $$
DECLARE
  product_count integer;
  share_count integer;
  invalid_count integer;
BEGIN
  SELECT COUNT(*) INTO product_count FROM products WHERE is_active = true;
  SELECT COUNT(DISTINCT product_id) INTO share_count FROM product_profit_shares;
  
  -- Check for invalid shares
  SELECT COUNT(*) INTO invalid_count
  FROM products p
  WHERE (
    SELECT COALESCE(SUM(share_percentage), 0)
    FROM product_profit_shares pps
    WHERE pps.product_id = p.id
  ) != 100;
  
  RAISE NOTICE '=== Migration Complete ===';
  RAISE NOTICE 'Active products: %', product_count;
  RAISE NOTICE 'Products with profit shares: %', share_count;
  RAISE NOTICE 'Invalid products (not 100%%): %', invalid_count;
  
  IF invalid_count > 0 THEN
    RAISE WARNING 'Some products have invalid profit shares!';
  ELSE
    RAISE NOTICE '✓ All products have valid profit shares';
  END IF;
END $$;
