import { Order } from '../../types';
import { calculateTotalProfitShare } from '../profitSharing';
import { PartnerProfitShares } from './types';

/**
 * Calculate Total Profit Shares for all Orders
 * 
 * Aggregates profit shares across all orders, splitting by partner
 * based on product ownership and configured percentages
 * 
 * @param orders - Array of orders
 * @returns Partner profit share breakdown
 * 
 * @example
 * const shares = await calculateTotalProfitShares(orders);
 * // { yassirShare: 7200, basimShare: 2400, totalProfit: 9600 }
 */
export async function calculateTotalProfitShares(
    orders: Order[]
): Promise<PartnerProfitShares> {
    const shares = { yassirShare: 0, basimShare: 0, totalProfit: 0 };

    for (const order of orders) {
        // Calculate discount amount
        const discountAmount = order.discount
            ? order.discount.type === 'percentage'
                ? (order.subtotal * order.discount.value) / 100
                : order.discount.value
            : 0;

        // Use existing profit sharing calculation
        const profitSharing = await calculateTotalProfitShare(
            order.items,
            order.shippingCost,
            order.paymentFees,
            discountAmount,
            order.isFreeShipping,
            order.paymentMethod.customer_fee || 0
        );

        shares.yassirShare += profitSharing.totalYassirShare;
        shares.basimShare += profitSharing.totalBasimShare;
        shares.totalProfit += profitSharing.totalYassirShare + profitSharing.totalBasimShare;
    }

    return shares;
}
