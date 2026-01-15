import { Order } from '../../types';
import { PartnerEarnings, PartnerProfitShares, PartnerNetProfit, PartnerExpenses } from './types';

/**
 * Calculate Partner Earnings
 * 
 * Earnings = Profit Share + Product Cost Recovery
 * This represents what should be paid out to each partner
 * 
 * @param orders - Array of orders
 * @param profitShares - Partner profit shares
 * @returns Partner earnings breakdown
 * 
 * @example
 * const earnings = calculatePartnerEarnings(orders, profitShares);
 * // {
 * //   yassirProductsCost: 6000,
 * //   basimProductsCost: 2500,
 * //   yassirTotalEarnings: 13200,
 * //   basimTotalEarnings: 4900,
 * //   combinedTotalEarnings: 18100
 * // }
 */
export function calculatePartnerEarnings(
    orders: Order[],
    profitShares: PartnerProfitShares
): PartnerEarnings {
    // Calculate product costs per owner
    const { yassirCost, basimCost } = orders.reduce(
        (acc, order) => {
            order.items.forEach(item => {
                const itemTotalCost = item.product.cost * item.quantity;
                if (item.product.owner === 'yassir') {
                    acc.yassirCost += itemTotalCost;
                } else if (item.product.owner === 'basim') {
                    acc.basimCost += itemTotalCost;
                }
            });
            return acc;
        },
        { yassirCost: 0, basimCost: 0 }
    );

    // Calculate total earnings (profit + cost recovery)
    const yassirTotalEarnings = profitShares.yassirShare + yassirCost;
    const basimTotalEarnings = profitShares.basimShare + basimCost;
    const combinedTotalEarnings = yassirTotalEarnings + basimTotalEarnings;

    return {
        yassirProductsCost: yassirCost,
        basimProductsCost: basimCost,
        yassirTotalEarnings,
        basimTotalEarnings,
        combinedTotalEarnings
    };
}

/**
 * Calculate Partner Net Profit
 * 
 * Net Profit = Earnings - Operating Expenses
 * This is the final amount available for distribution after all costs
 * 
 * @param earnings - Partner earnings
 * @param expenses - Partner expenses
 * @returns Partner net profit breakdown
 * 
 * @example
 * const netProfit = calculatePartnerNetProfit(earnings, expenses);
 * // {
 * //   yassirNetProfit: 11400,
 * //   basimNetProfit: 3700,
 * //   combinedNetProfit: 15100
 * // }
 */
export function calculatePartnerNetProfit(
    earnings: PartnerEarnings,
    expenses: PartnerExpenses
): PartnerNetProfit {
    return {
        yassirNetProfit: earnings.yassirTotalEarnings - expenses.yassirExpenses,
        basimNetProfit: earnings.basimTotalEarnings - expenses.basimExpenses,
        combinedNetProfit: earnings.combinedTotalEarnings - expenses.totalExpenses
    };
}
