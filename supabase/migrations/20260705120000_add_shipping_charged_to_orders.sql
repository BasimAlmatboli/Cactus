/*
  # Split shipping into charged (revenue) vs cost (expense)

  Background:
    The orders table had a single `shipping_cost` column that was overloaded
    to mean both "what the customer paid for shipping" (revenue) and
    "what we pay the carrier" (expense). When those differ (e.g. Salla charges
    the customer 14 SAR but RedBox costs 15 SAR), the order total was wrong.

  Changes:
    1. Add `shipping_charged` (numeric) - revenue side: what the customer paid.
    2. Backfill it consistently with each order's EXISTING stored total:
         - free-shipping orders  -> 0 (customer paid nothing for shipping)
         - all other orders      -> shipping_cost (charged == carrier cost)
       This is a no-op for historical totals; nothing changes retroactively.
    3. Add `shipping_subsidy` as a generated column = shipping_cost - shipping_charged.
       Positive = we subsidised shipping (a cost). Negative = shipping profit.

  Notes:
    - `shipping_cost` keeps its meaning: carrier cost (expense side).
    - Idempotent: safe to re-run.
*/

-- 1. Add the revenue-side column (nullable first so we can backfill)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_charged numeric;

-- 2. Backfill existing rows to stay consistent with their stored total
UPDATE orders
SET shipping_charged = CASE
    WHEN is_free_shipping THEN 0
    ELSE shipping_cost
  END
WHERE shipping_charged IS NULL;

-- 3. Lock it down: default 0, non-null, non-negative
ALTER TABLE orders
  ALTER COLUMN shipping_charged SET DEFAULT 0;

ALTER TABLE orders
  ALTER COLUMN shipping_charged SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'orders' AND constraint_name = 'orders_shipping_charged_nonneg'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT orders_shipping_charged_nonneg CHECK (shipping_charged >= 0);
  END IF;
END $$;

-- 4. Derived subsidy column (cost - charged); auto-maintained by Postgres
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_subsidy numeric
  GENERATED ALWAYS AS (shipping_cost - shipping_charged) STORED;

-- 5. Document the columns
COMMENT ON COLUMN orders.shipping_charged IS 'Revenue side: amount charged to the customer for shipping (0 when free shipping).';
COMMENT ON COLUMN orders.shipping_cost     IS 'Expense side: amount the business pays the carrier.';
COMMENT ON COLUMN orders.shipping_subsidy  IS 'Derived: shipping_cost - shipping_charged. Positive = shipping loss/subsidy (an expense), negative = shipping profit.';
