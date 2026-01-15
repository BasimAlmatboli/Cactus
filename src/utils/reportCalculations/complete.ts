import { Order } from '../../types';
import { Expense } from '../../types/expense';
import { ReportMetrics, ReportCalculationInput } from './types';

// Import all calculation functions
import { calculateTotalOrders, calculateAverageOrderValue } from './volume';
import { calculateTotalRevenue } from './revenue';
import {
    calculateTotalProductCosts,
    calculateTotalShippingFees,
    calculateTotalPaymentFees,
    calculateTotalFees,
    calculateShippingFeeData,
    calculatePaymentFeeData
} from './costs';
import {
    calculateGrossProfit,
    calculateNetProfit,
    calculateGrossProfitMargin,
    calculateNetProfitMargin,
    calculateGrossProfitPerOrder,
    calculateNetProfitPerOrder
} from './profit';
import { calculateExpensesByPartner, calculateMarketingExpenses } from './expenses';
import { calculateTotalProfitShares } from './profitSharing';
import { calculatePartnerEarnings, calculatePartnerNetProfit } from './earnings';

/**
 * Calculate All Report Metrics
 * 
 * **MAIN ORCHESTRATOR FUNCTION**
 * 
 * This is the single source of truth for all report calculations.
 * Call this once and pass the result to all report components.
 * 
 * @param input - Orders and expenses
 * @returns Complete report metrics object
 * 
 * @example
 * const metrics = await calculateAllReportMetrics({ orders, expenses });
 * 
 * // Pass to components
 * <BusinessMetricsReport metrics={metrics} />
 * <NetProfitReport metrics={metrics} />
 */
export async function calculateAllReportMetrics(
    input: ReportCalculationInput
): Promise<ReportMetrics> {
    const { orders, expenses } = input;

    // ==========================================
    // VOLUME METRICS
    // ==========================================
    const totalOrders = calculateTotalOrders(orders);
    const totalRevenue = calculateTotalRevenue(orders);
    const averageOrderValue = calculateAverageOrderValue(totalRevenue, totalOrders);

    // ==========================================
    // COST METRICS
    // ==========================================
    const totalProductCosts = calculateTotalProductCosts(orders);
    const totalShippingFees = calculateTotalShippingFees(orders);
    const totalPaymentFees = calculateTotalPaymentFees(orders);
    const totalFees = calculateTotalFees(totalShippingFees, totalPaymentFees);

    // ==========================================
    // PROFIT METRICS
    // ==========================================
    const grossProfit = calculateGrossProfit(totalRevenue, totalProductCosts);

    // Operating expenses
    const expensesBreakdown = calculateExpensesByPartner(expenses);
    const marketingExpenses = calculateMarketingExpenses(expenses);

    const netProfit = calculateNetProfit(
        grossProfit,
        totalFees,
        expensesBreakdown.totalExpenses
    );

    const grossProfitMargin = calculateGrossProfitMargin(grossProfit, totalRevenue);
    const netProfitMargin = calculateNetProfitMargin(netProfit, totalRevenue);
    const grossProfitPerOrder = calculateGrossProfitPerOrder(grossProfit, totalOrders);
    const netProfitPerOrder = calculateNetProfitPerOrder(netProfit, totalOrders);

    // ==========================================
    // PARTNER METRICS
    // ==========================================

    // Profit shares (async calculation)
    const profitShares = await calculateTotalProfitShares(orders);

    // Earnings (profit + cost recovery)
    const earnings = calculatePartnerEarnings(orders, profitShares);

    // Partner net profit (earnings - expenses)
    const partnerNetProfit = calculatePartnerNetProfit(earnings, expensesBreakdown);

    // ==========================================
    // ADDITIONAL METRICS
    // ==========================================
    const productCostPercent = totalRevenue > 0
        ? (totalProductCosts / totalRevenue) * 100
        : 0;

    const feeImpactPercent = totalRevenue > 0
        ? (totalFees / totalRevenue) * 100
        : 0;

    // ==========================================
    // FEE ANALYSIS BREAKDOWNS
    // ==========================================
    const shippingFeeData = calculateShippingFeeData(orders);
    const paymentFeeData = calculatePaymentFeeData(orders);

    // ==========================================
    // RETURN COMPLETE METRICS
    // ==========================================
    return {
        // Volume
        totalOrders,
        totalRevenue,
        averageOrderValue,

        // Costs
        totalProductCosts,
        totalShippingFees,
        totalPaymentFees,
        totalFees,

        // Profit
        grossProfit,
        netProfit,
        grossProfitMargin,
        netProfitMargin,
        grossProfitPerOrder,
        netProfitPerOrder,

        // Partner Metrics
        profitShares,
        earnings,
        expenses: expensesBreakdown,
        partnerNetProfit,

        // Additional
        marketingExpenses,
        productCostPercent,
        feeImpactPercent,

        // Fee Analysis
        shippingFeeData,
        paymentFeeData
    };
}

/**
 * Simplified overload for direct parameters
 */
export async function calculateAllReportMetricsFromParams(
    orders: Order[],
    expenses: Expense[]
): Promise<ReportMetrics> {
    return calculateAllReportMetrics({ orders, expenses });
}
