import type { OrderItem } from '../../types';

/**
 * Calculate Order Subtotal
 * 
 * Formula: Sum of (product selling price × quantity) for all items
 * 
 * Example:
 * Items:
 *   - Product A: 50 SAR × 2 = 100 SAR
 *   - Product B: 30 SAR × 1 = 30 SAR
 * Result: 130 SAR
 * 
 * @param items - Array of order items
 * @returns Total subtotal before shipping, fees, or discounts
 */
export function calculateSubtotal(items: OrderItem[]): number {
    return items.reduce(
        (sum, item) => sum + item.product.sellingPrice * item.quantity,
        0
    );
}
