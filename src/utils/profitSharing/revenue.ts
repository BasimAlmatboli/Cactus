import { OrderItem } from '../../types';

/**
 * Calculate Item Revenue (Including Proportional Shipping)
 * 
 * Calculates an item's total revenue by adding its subtotal to its
 * proportional share of the shipping cost.
 * 
 * Formula: itemSubtotal + (shippingCost × itemProportion)
 * 
 * Example:
 * Item Selling Price: 50 SAR × 2 qty = 100 SAR
 * Total Order Subtotal: 150 SAR
 * Item Proportion: 100/150 = 0.667 (66.7%)
 * Shipping Cost: 15 SAR
 * Proportional Shipping: 15 × 0.667 = 10 SAR
 * Item Revenue: 100 + 10 = 110 SAR
 * 
 * @param item - Order item with product and quantity
 * @param totalSubtotal - Total subtotal of all items in order
 * @param shippingCost - Total shipping cost for order
 * @returns Item's revenue including proportional shipping
 */
export const calculateItemRevenue = (
  item: OrderItem,
  totalSubtotal: number,
  shippingCost: number
): number => {
  const subtotal = item.product.sellingPrice * item.quantity;
  // Calculate this item's proportion of the total subtotal
  const proportion = subtotal / totalSubtotal;
  // Add proportional shipping cost to the item's revenue
  return subtotal + (shippingCost * proportion);
};

/**
 * Calculate Total Order Revenue
 * 
 * Formula: totalSubtotal + shippingCost
 * 
 * Example:
 * Item A: 50 SAR × 2 = 100 SAR
 * Item B: 30 SAR × 1 = 30 SAR
 * Subtotal: 130 SAR
 * Shipping: 15 SAR
 * Total Revenue: 145 SAR
 * 
 * @param items - All items in the order
 * @param shippingCost - Shipping cost
 * @returns Total order revenue
 */
export const calculateTotalRevenue = (
  items: OrderItem[],
  shippingCost: number
): number => {
  const totalSubtotal = items.reduce(
    (sum, item) => sum + (item.product.sellingPrice * item.quantity),
    0
  );
  return totalSubtotal + shippingCost;
};

/**
 * Calculate Revenue Proportion (Item's Share of Total)
 * 
 * Determines what percentage of the total order value this item represents.
 * 
 * Formula: itemSubtotal / totalSubtotal
 * 
 * Example 1 (Normal):
 * Item Subtotal: 100 SAR
 * Total Subtotal: 150 SAR
 * Result: 0.667 (66.7% of order)
 * 
 * Example 2 (Edge case - zero total):
 * Item Subtotal: 0 SAR
 * Total Subtotal: 0 SAR
 * Result: 0 (prevents division by zero)
 * 
 * @param itemSubtotal - Subtotal for this item
 * @param totalSubtotal - Total subtotal of all items
 * @returns Proportion (0-1) representing item's share
 */
export const calculateRevenueProportion = (
  itemSubtotal: number,
  totalSubtotal: number
): number => {
  return totalSubtotal > 0 ? itemSubtotal / totalSubtotal : 0;
};