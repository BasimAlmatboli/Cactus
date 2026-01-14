/*
  # Add Expense Split Percentages and Tax Support

  1. New Columns
    - `basim_share_percentage` (real, default 50.0) - Basim's ownership percentage
    - `yassir_share_percentage` (real, default 50.0) - Yasir's ownership percentage  
    - `include_tax` (boolean, default false) - Whether 15% VAT is included
    - `amount_before_tax` (numeric, nullable) - Original amount before tax

  2. Data Migration
    - Set existing 'shared' expenses to 50/50 split
    - Set existing 'basim' expenses to 100/0 split
    - Set existing 'yassir' expenses to 0/100 split
*/

-- Add new columns to expenses table
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS basim_share_percentage real DEFAULT 50.0,
ADD COLUMN IF NOT EXISTS yassir_share_percentage real DEFAULT 50.0,
ADD COLUMN IF NOT EXISTS include_tax boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS amount_before_tax numeric;

-- Migrate existing data based on owner field
-- For 'shared' owner: 50/50 split (default values already set)
UPDATE expenses 
SET basim_share_percentage = 50.0, 
    yassir_share_percentage = 50.0
WHERE owner = 'shared';

-- For 'basim' owner: 100/0 split
UPDATE expenses 
SET basim_share_percentage = 100.0, 
    yassir_share_percentage = 0.0
WHERE owner = 'basim';

-- For 'yassir' owner: 0/100 split  
UPDATE expenses 
SET basim_share_percentage = 0.0, 
    yassir_share_percentage = 100.0
WHERE owner = 'yassir';

-- Add check constraint to ensure percentages are valid
ALTER TABLE expenses
ADD CONSTRAINT check_percentages_valid 
CHECK (
  basim_share_percentage >= 0 AND basim_share_percentage <= 100 AND
  yassir_share_percentage >= 0 AND yassir_share_percentage <= 100
);

-- Add comment for documentation
COMMENT ON COLUMN expenses.basim_share_percentage IS 'Basim ownership percentage (0-100)';
COMMENT ON COLUMN expenses.yassir_share_percentage IS 'Yasir ownership percentage (0-100)';
COMMENT ON COLUMN expenses.include_tax IS 'Whether amount includes 15% VAT';
COMMENT ON COLUMN expenses.amount_before_tax IS 'Original amount before 15% tax (null if no tax)';
