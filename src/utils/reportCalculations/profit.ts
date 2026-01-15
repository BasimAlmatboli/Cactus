/**
 * Profit Calculation Functions
 * 
 * Handles gross profit, net profit, and related margins
 */

/**
 * Calculate Gross Profit
 * 
 * Formula: Revenue - Product Costs (COGS)
 * 
 * @param totalRevenue - Total revenue
 * @param totalProduct Costs - Total product costs
 * @returns Gross profit
 * 
 * @example
 * const grossProfit = calculateGrossProfit(25000, 8500); // 16500 SAR
 */
export function calculateGrossProfit(
    totalRevenue: number,
    totalProductCosts: number
): number {
    return totalRevenue - totalProductCosts;
}

/**
 * Calculate Net Profit
 * 
 * Formula: Gross Profit - Total Fees - Operating Expenses
 * 
 * @param grossProfit - Gross profit
 * @param totalFees - Total shipping & payment fees
 * @param totalExpenses - Operating expenses (ads, etc.)
 * @returns Net profit
 * 
 * @example
 * const netProfit = calculateNetProfit(16500, 1525, 3000); // 11975 SAR
 */
export function calculateNetProfit(
    grossProfit: number,
    totalFees: number,
    totalExpenses: number
): number {
    return grossProfit - totalFees - totalExpenses;
}

/**
 * Calculate Gross Profit Margin
 * 
 * Formula: (Gross Profit / Revenue) × 100
 * 
 * @param grossProfit - Gross profit
 * @param totalRevenue - Total revenue
 * @returns Gross profit margin as percentage
 * 
 * @example
 * const margin = calculateGrossProfitMargin(16500, 25000); // 66%
 */
export function calculateGrossProfitMargin(
    grossProfit: number,
    totalRevenue: number
): number {
    return totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
}

/**
 * Calculate Net Profit Margin
 * 
 * Formula: (Net Profit / Revenue) × 100
 * 
 * @param netProfit - Net profit
 * @param totalRevenue - Total revenue
 * @returns Net profit margin as percentage
 * 
 * @example
 * const margin = calculateNetProfitMargin(11975, 25000); // 47.9%
 */
export function calculateNetProfitMargin(
    netProfit: number,
    totalRevenue: number
): number {
    return totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
}

/**
 * Calculate Gross Profit Per Order
 * 
 * @param grossProfit - Total gross profit
 * @param totalOrders - Total number of orders
 * @returns Average gross profit per order
 * 
 * @example
 * const perOrder = calculateGrossProfitPerOrder(16500, 150); // 110 SAR per order
 */
export function calculateGrossProfitPerOrder(
    grossProfit: number,
    totalOrders: number
): number {
    return totalOrders > 0 ? grossProfit / totalOrders : 0;
}

/**
 * Calculate Net Profit Per Order
 * 
 * @param netProfit - Total net profit
 * @param totalOrders - Total number of orders
 * @returns Average net profit per order
 * 
 * @example
 * const perOrder = calculateNetProfitPerOrder(11975, 150); // 79.83 SAR per order
 */
export function calculateNetProfitPerOrder(
    netProfit: number,
    totalOrders: number
): number {
    return totalOrders > 0 ? netProfit / totalOrders : 0;
}
