-- Add customer_fee column to payment_methods table
-- This represents the fee charged TO THE CUSTOMER for using this payment method
-- Example: 10 SAR COD fee (عمولة الدفع عند الاستلام)

ALTER TABLE payment_methods 
ADD COLUMN customer_fee DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- Add comment explaining the difference
COMMENT ON COLUMN payment_methods.customer_fee IS 'Fee charged to customer for using this payment method (e.g., COD fee). Added to order total.';
COMMENT ON COLUMN payment_methods.fee_percentage IS 'Gateway processing fee percentage that YOU pay (not charged to customer).';
COMMENT ON COLUMN payment_methods.fee_fixed IS 'Gateway processing fixed fee that YOU pay (not charged to customer).';

-- Example: Set 10 SAR customer fee for COD/MADA if it exists
-- UPDATE payment_methods SET customer_fee = 10.00 WHERE name = 'MADA';
