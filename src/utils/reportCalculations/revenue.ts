import { Order } from '../../types';

/**
 * Calculate Total Revenue
 * 
 * Sum of all order totals (what customers paid)
 * 
 * @param orders - Array of orders
 * @returns Total revenue across all orders
 * 
 * @example
 * const revenue = calculateTotalRevenue(orders); // 25000 SAR
 */
export function calculateTotalRevenue(orders: Order[]): number {
    return orders.reduce((sum, order) => sum + order.total, 0);
}
