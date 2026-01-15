import { Order } from '../../types';

/**
 * Calculate Total Number of Orders
 * 
 * @param orders - Array of orders
 * @returns Total count of orders
 * 
 * @example
 * const total = calculateTotalOrders(orders); // 150
 */
export function calculateTotalOrders(orders: Order[]): number {
    return orders.length;
}

/**
 * Calculate Average Order Value (AOV)
 * 
 * @param totalRevenue - Total revenue from all orders
 * @param totalOrders - Total number of orders
 * @returns Average order value
 * 
 * @example
 * const aov = calculateAverageOrderValue(15000, 150); // 100 SAR per order
 */
export function calculateAverageOrderValue(
    totalRevenue: number,
    totalOrders: number
): number {
    return totalOrders > 0 ? totalRevenue / totalOrders : 0;
}
