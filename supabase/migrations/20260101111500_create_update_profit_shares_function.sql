/*
  # Create function to update profit shares safely
  
  This function updates profit shares for a product by:
  1. Temporarily disabling the validation trigger
  2. Deleting old shares
  3. Inserting new shares
  4. Re-enabling the trigger
  5. Validating the final result
*/

CREATE OR REPLACE FUNCTION update_product_profit_shares(
  p_product_id text,
  p_shares jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  share_record jsonb;
  total_percentage numeric := 0;
BEGIN
  -- Disable trigger temporarily
  ALTER TABLE product_profit_shares DISABLE TRIGGER validate_profit_shares_sum_trigger;
  
  -- Delete existing shares for this product
  DELETE FROM product_profit_shares WHERE product_id = p_product_id;
  
  -- Insert new shares
  FOR share_record IN SELECT * FROM jsonb_array_elements(p_shares)
  LOOP
    INSERT INTO product_profit_shares (product_id, partner_id, share_percentage)
    VALUES (
      p_product_id,
      (share_record->>'partner_id')::uuid,
      (share_record->>'share_percentage')::numeric
    );
    
    total_percentage := total_percentage + (share_record->>'share_percentage')::numeric;
  END LOOP;
  
  -- Re-enable trigger
  ALTER TABLE product_profit_shares ENABLE TRIGGER validate_profit_shares_sum_trigger;
  
  -- Validate total
  IF ABS(total_percentage - 100) > 0.01 THEN
    RAISE EXCEPTION 'Profit shares must sum to 100%%. Current total: %', total_percentage;
  END IF;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_product_profit_shares(text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION update_product_profit_shares(text, jsonb) TO anon;
