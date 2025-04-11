import { OrderItem } from '../../types';

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

export const calculateRevenueProportion = (
  itemSubtotal: number,
  totalSubtotal: number
): number => {
  return totalSubtotal > 0 ? itemSubtotal / totalSubtotal : 0;
};