/**
 * Calculate Customer Total (Final Amount Customer Pays)
 * 
 * Formula: subtotal + shipping - discount + customerFee
 * 
 * Step-by-step breakdown:
 * 1. Start with subtotal (products total)
 * 2. Add shipping cost (0 if free shipping)
 * 3. Subtract discount amount
 * 4. Add customer fee (e.g., COD fee)
 * 
 * Example 1 (With Free Shipping and COD Fee):
 * Subtotal:        130 SAR (products)
 * + Shipping:        0 SAR (free shipping applied)
 * - Discount:       13 SAR (10% off subtotal)
 * + Customer Fee:   10 SAR (COD fee)
 * ─────────────────────────
 * = Customer Total: 127 SAR ← What customer pays
 * 
 * Example 2 (With Paid Shipping, No COD Fee):
 * Subtotal:        100 SAR
 * + Shipping:       15 SAR (customer pays shipping)
 * - Discount:       20 SAR (fixed discount)
 * + Customer Fee:    0 SAR (no COD)
 * ─────────────────────────
 * = Customer Total:  95 SAR
 * 
 * Example 3 (No Discount, With COD):
 * Subtotal:        200 SAR
 * + Shipping:       15 SAR
 * - Discount:        0 SAR (no discount)
 * + Customer Fee:   10 SAR (COD fee)
 * ─────────────────────────
 * = Customer Total: 225 SAR
 * 
 * @param params - Object containing all calculation components
 * @param params.subtotal - Sum of all products
 * @param params.shippingCost - Actual shipping cost (0 if free)
 * @param params.discountAmount - Discount to apply
 * @param params.customerFee - Additional fee charged to customer (e.g., COD fee)
 * @returns Final amount customer must pay
 */
export function calculateCustomerTotal(params: {
    subtotal: number;
    shippingCost: number;
    discountAmount: number;
    customerFee: number;
}): number {
    return (
        params.subtotal +
        params.shippingCost -
        params.discountAmount +
        params.customerFee
    );
}
