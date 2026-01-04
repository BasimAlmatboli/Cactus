import { Order } from '../types';
import { calculateCachedProfitShare } from '../services/profitShareService';

/**
 * Calculate profit share for a product using database percentages
 * @deprecated Use calculateCachedProfitShare from profitShareService instead
 */
export const calculateProfitShare = async (
  productId: string,
  netProfit: number
): Promise<{ yassirShare: number; basimShare: number }> => {
  return await calculateCachedProfitShare(productId, netProfit);
};

/**
 * Calculate profit share for an entire order
 * Uses database profit sharing percentages
 */
export const calculateOrderProfitShare = async (order: Order) => {
  const totalRevenue = order.items.reduce((sum, item) =>
    sum + (item.product.sellingPrice * item.quantity),
    0
  );

  let totalPartnerShare = 0;
  let totalMyShare = 0;

  // Process each item
  for (const item of order.items) {
    const revenue = item.product.sellingPrice * item.quantity;
    const cost = item.product.cost * item.quantity;

    // Calculate this item's proportion of total revenue
    const revenueProportion = revenue / totalRevenue;

    // Distribute expenses proportionally based on revenue
    const itemExpenseShare = (order.shippingCost + order.paymentFees) * revenueProportion;

    // Calculate net profit
    const itemProfit = revenue - cost - itemExpenseShare;

    // Get profit shares from database
    const shares = await calculateCachedProfitShare(item.product.id, itemProfit);
    totalPartnerShare += shares.yassir;
    totalMyShare += shares.basim;
  }

  return {
    partnerGrossShare: totalPartnerShare,
    myGrossShare: totalMyShare,
    partnerShare: totalPartnerShare,
    myShare: totalMyShare
  };
};