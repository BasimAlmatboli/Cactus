import type { Discount } from '../../types';

/**
 * Calculate Discount Amount
 * 
 * Formula:
 * - Percentage: subtotal × (discount% / 100)
 * - Fixed: discount value directly
 * 
 * Example 1 (Percentage):
 * Subtotal: 130 SAR
 * Discount: 10%
 * Calculation: 130 × (10 / 100) = 13 SAR
 * 
 * Example 2 (Fixed):
 * Subtotal: 130 SAR
 * Discount: 20 SAR
 * Result: 20 SAR
 * 
 * @param subtotal - Order subtotal
 * @param discount - Discount object (percentage or fixed) or null
 * @returns Amount to subtract from subtotal
 */
export function calculateDiscountAmount(
    subtotal: number,
    discount: Discount | null
): number {
    if (!discount) return 0;

    return discount.type === 'percentage'
        ? (subtotal * discount.value) / 100
        : discount.value;
}
