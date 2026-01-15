import { Order } from '../../types';
import { Expense } from '../../types/expense';

/**
 * Volume Metrics
 */
export interface VolumeMetrics {
    totalOrders: number;
    averageOrderValue: number;
}

/**
 * Cost Metrics
 */
export interface CostMetrics {
    totalProductCosts: number;
    totalShippingFees: number;
    totalPaymentFees: number;
    totalFees: number;
}

/**
 * Profit Metrics
 */
export interface ProfitMetrics {
    grossProfit: number;
    netProfit: number;
    grossProfitMargin: number;
    netProfitMargin: number;
    grossProfitPerOrder: number;
    netProfitPerOrder: number;
}

/**
 * Partner Profit Shares
 */
export interface PartnerProfitShares {
    yassirShare: number;
    basimShare: number;
    totalProfit: number;
}

/**
 * Partner Earnings (Profit + Cost Recovery)
 */
export interface PartnerEarnings {
    yassirProductsCost: number;
    basimProductsCost: number;
    yassirTotalEarnings: number;
    basimTotalEarnings: number;
    combinedTotalEarnings: number;
}

/**
 * Partner Expenses
 */
export interface PartnerExpenses {
    yassirExpenses: number;
    basimExpenses: number;
    totalExpenses: number;
}

/**
 * Partner Net Profit (Earnings - Expenses)
 */
export interface PartnerNetProfit {
    yassirNetProfit: number;
    basimNetProfit: number;
    combinedNetProfit: number;
}

/**
 * Complete Report Metrics
 * Single source of truth for all report calculations
 */
export interface ReportMetrics {
    // Volume
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;

    // Costs
    totalProductCosts: number;
    totalShippingFees: number;
    totalPaymentFees: number;
    totalFees: number;

    // Profit
    grossProfit: number;
    netProfit: number;
    grossProfitMargin: number;
    netProfitMargin: number;
    grossProfitPerOrder: number;
    netProfitPerOrder: number;

    // Partner Profit Shares
    profitShares: PartnerProfitShares;

    // Partner Earnings
    earnings: PartnerEarnings;

    // Operating Expenses
    expenses: PartnerExpenses;

    // Partner Net Profit
    partnerNetProfit: PartnerNetProfit;

    // Additional Metrics
    marketingExpenses: number;
    productCostPercent: number;
    feeImpactPercent: number;

    // Fee Analysis Breakdowns
    shippingFeeData: ShippingFeeData;
    paymentFeeData: PaymentFeeData;
}

/**
 * Input for calculating all report metrics
 */
export interface ReportCalculationInput {
    orders: Order[];
    expenses: Expense[];
}

/**
 * Shipping Fee Breakdown by Company
 */
export interface ShippingCompanyBreakdown {
    companyName: string;
    orderCount: number;
    totalFees: number;
    averageFee: number;
}

/**
 * Payment Fee Breakdown by Method
 */
export interface PaymentMethodBreakdown {
    methodName: string;
    orderCount: number;
    totalFees: number;
    averageFee: number;
}

/**
 * Detailed Shipping Fee Data
 */
export interface ShippingFeeData {
    totalShippingFees: number;
    freeShippingCount: number;
    paidShippingCount: number;
    averageShippingFee: number;
    totalRevenue: number;
    feesAsPercentOfRevenue: number;
    byCompany: ShippingCompanyBreakdown[];
}

/**
 * Detailed Payment Fee Data
 */
export interface PaymentFeeData {
    totalPaymentFees: number;
    averagePaymentFee: number;
    totalRevenue: number;
    feesAsPercentOfRevenue: number;
    averageFeePercentage: number;
    byMethod: PaymentMethodBreakdown[];
}
