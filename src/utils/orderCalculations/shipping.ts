/**
 * Determine if Order Qualifies for Free Shipping
 * 
 * Formula: (subtotal - discount) >= threshold
 * 
 * Example 1 (Free Shipping):
 * Subtotal: 130 SAR
 * Discount: 13 SAR
 * Total for check: 130 - 13 = 117 SAR
 * Threshold: 100 SAR
 * Result: 117 >= 100 → true (FREE SHIPPING!)
 * 
 * Example 2 (No Free Shipping):
 * Subtotal: 80 SAR
 * Discount: 0 SAR
 * Total for check: 80 SAR
 * Threshold: 100 SAR
 * Result: 80 < 100 → false (customer pays shipping)
 * 
 * @param subtotal - Order subtotal
 * @param discountAmount - Already calculated discount amount
 * @param freeShippingThreshold - Minimum amount for free shipping
 * @returns true if order qualifies for free shipping
 */
export function determineIsFreeShipping(
    subtotal: number,
    discountAmount: number,
    freeShippingThreshold: number
): boolean {
    const totalForFreeShipping = subtotal - discountAmount;
    return totalForFreeShipping >= freeShippingThreshold;
}

/**
 * Calculate Actual Shipping Cost to Charge Customer
 * 
 * Formula: isFreeShipping ? 0 : shippingMethodCost
 * 
 * Example 1 (Free Shipping):
 * Shipping Method Cost: 15 SAR
 * Is Free Shipping: true
 * Result: 0 SAR (customer pays nothing)
 * 
 * Example 2 (Paid Shipping):
 * Shipping Method Cost: 15 SAR
 * Is Free Shipping: false
 * Result: 15 SAR (customer pays full price)
 * 
 * @param shippingMethodCost - Cost defined in shipping method
 * @param isFreeShipping - Whether free shipping applies
 * @returns Cost to charge customer (0 or full price)
 */
export function calculateActualShippingCost(
    shippingMethodCost: number,
    isFreeShipping: boolean
): number {
    return isFreeShipping ? 0 : shippingMethodCost;
}
