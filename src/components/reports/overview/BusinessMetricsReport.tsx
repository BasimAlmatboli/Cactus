import React from 'react';
import { Order } from '../../../types';
import { Expense } from '../../../types/expense';
import {
    TrendingUp,
    DollarSign,
    ShoppingCart,
    Target,
    Percent,
    TrendingDown,
    AlertCircle,
    CheckCircle2,
    BarChart3,
    Megaphone,
    Database,
    ShoppingBag
} from 'lucide-react';

interface EarningsData {
    yassirProductsCost: number;
    basimProductsCost: number;
    yassirTotalEarnings: number;
    basimTotalEarnings: number;
    combinedTotalEarnings: number;
}

interface ExpensesData {
    yassirExpenses: number;
    basimExpenses: number;
    totalExpenses: number;
}

interface BusinessMetricsReportProps {
    orders: Order[];
    earningsData: EarningsData | null;
    expensesData: ExpensesData | null;
    expenses: Expense[];
}

interface BusinessMetrics {
    // Volume metrics
    totalOrders: number;
    totalRevenue: number;

    // Cost metrics
    totalProductCost: number;
    totalShippingFees: number;
    totalPaymentFees: number;
    totalFees: number;
    marketingExpenses: number;
    totalExpenses: number;

    // Profit metrics
    grossProfit: number;
    netProfit: number;

    // Calculated KPIs
    aov: number;
    productCostPercent: number;
    grossProfitMargin: number;
    grossProfitPerOrder: number;
    netProfitMargin: number;
    netProfitPerOrder: number;
    roas: number;
    adSpendPercent: number;
    cpo: number;
    feeImpactPercent: number;
    breakEvenRoas: number;
}

export const BusinessMetricsReport: React.FC<BusinessMetricsReportProps> = ({
    orders,
    earningsData,
    expensesData,
    expenses
}) => {
    if (!orders?.length || !earningsData || !expensesData) {
        return (
            <div className="bg-[#1C1F26] rounded-xl border border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                        <BarChart3 className="h-6 w-6 text-purple-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">Business Metrics Dashboard</h2>
                </div>
                <p className="text-gray-500">No data available.</p>
            </div>
        );
    }

    // Calculate all metrics
    const metrics = calculateBusinessMetrics(orders, expensesData, expenses);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-[#1C1F26] rounded-xl border border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                        <BarChart3 className="h-6 w-6 text-purple-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">Business Metrics Dashboard</h2>
                </div>
                <p className="text-sm text-gray-400 ml-14">
                    Key performance indicators for your e-commerce business
                </p>
            </div>

            {/* Key Performance Indicators Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Average Order Value */}
                <MetricCard
                    label="Average Order Value"
                    value={metrics.aov.toFixed(2)}
                    unit="SAR"
                    icon={<ShoppingCart className="h-5 w-5" />}
                    color="blue"
                />

                {/* Total Orders */}
                <MetricCard
                    label="Total Orders"
                    value={metrics.totalOrders.toString()}
                    unit="orders"
                    icon={<Target className="h-5 w-5" />}
                    color="green"
                />

                {/* Total Revenue */}
                <MetricCard
                    label="Total Revenue"
                    value={metrics.totalRevenue.toFixed(2)}
                    unit="SAR"
                    icon={<DollarSign className="h-5 w-5" />}
                    color="emerald"
                />

                {/* ROAS */}
                <MetricCard
                    label="ROAS (Return on Ad Spend)"
                    value={metrics.roas === Infinity ? '∞' : metrics.roas.toFixed(2)}
                    unit="x"
                    icon={<Megaphone className="h-5 w-5" />}
                    color="purple"
                    subtitle={metrics.marketingExpenses === 0 ? 'No ad spend' : undefined}
                />

                {/* Net Profit per Order */}
                <MetricCard
                    label="Net Profit per Order"
                    value={metrics.netProfitPerOrder.toFixed(2)}
                    unit="SAR"
                    icon={<TrendingUp className="h-5 w-5" />}
                    color={metrics.netProfitPerOrder >= 0 ? 'green' : 'red'}
                />

                {/* Gross Profit Margin */}
                <MetricCard
                    label="Gross Profit Margin"
                    value={metrics.grossProfitMargin.toFixed(2)}
                    unit="%"
                    icon={<Percent className="h-5 w-5" />}
                    color="teal"
                />

                {/* Ad Spend % of Revenue */}
                <MetricCard
                    label="Ad Spend % of Revenue"
                    value={metrics.adSpendPercent.toFixed(2)}
                    unit="%"
                    icon={<Megaphone className="h-5 w-5" />}
                    color="orange"
                />

                {/* Product Cost % */}
                <MetricCard
                    label="Product Cost %"
                    value={metrics.productCostPercent.toFixed(2)}
                    unit="%"
                    icon={<TrendingDown className="h-5 w-5" />}
                    color="amber"
                />

                {/* Gross Profit per Order */}
                <MetricCard
                    label="Gross Profit per Order"
                    value={metrics.grossProfitPerOrder.toFixed(2)}
                    unit="SAR"
                    icon={<DollarSign className="h-5 w-5" />}
                    color="green"
                />

                {/* Cost Per Order (CPO) */}
                <MetricCard
                    label="Cost Per Order (CPO)"
                    value={metrics.cpo.toFixed(2)}
                    unit="SAR"
                    icon={<TrendingDown className="h-5 w-5" />}
                    color="orange"
                />

                {/* Net Profit Margin */}
                <MetricCard
                    label="Net Profit Margin"
                    value={metrics.netProfitMargin.toFixed(2)}
                    unit="%"
                    icon={<Percent className="h-5 w-5" />}
                    color={metrics.netProfitMargin >= 0 ? 'green' : 'red'}
                />

                {/* Fee Impact % */}
                <MetricCard
                    label="Total Fee Impact"
                    value={metrics.feeImpactPercent.toFixed(2)}
                    unit="%"
                    icon={<AlertCircle className="h-5 w-5" />}
                    color="red"
                    subtitle="Shipping + Payment"
                />
            </div>

            {/* Profitability Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profit Funnel */}
                <div className="bg-[#1C1F26] rounded-xl border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-400" />
                        Profit Funnel
                    </h3>

                    <div className="space-y-4">
                        {/* 1. Revenue */}
                        <FunnelStep
                            label="Total Revenue"
                            value={metrics.totalRevenue}
                            total={metrics.totalRevenue}
                            color="blue"
                            icon={<DollarSign className="h-4 w-4" />}
                            isTotal
                        />

                        {/* Deduct Product Costs */}
                        <FunnelStep
                            label="Product Costs"
                            value={metrics.totalProductCost}
                            total={metrics.totalRevenue}
                            color="orange"
                            isDeduction
                            icon={<ShoppingBag className="h-4 w-4" />}
                        />

                        {/* 2. Gross Profit */}
                        <FunnelStep
                            label="Gross Profit"
                            value={metrics.grossProfit}
                            total={metrics.totalRevenue}
                            color="emerald"
                        />

                        {/* Deduct Fees */}
                        <FunnelStep
                            label="Shipping & Payment Fees"
                            value={metrics.totalFees}
                            total={metrics.totalRevenue}
                            color="red"
                            isDeduction
                            icon={<AlertCircle className="h-4 w-4" />}
                        />

                        {/* Deduct Expenses */}
                        <FunnelStep
                            label="Operating Expenses"
                            value={metrics.totalExpenses}
                            total={metrics.totalRevenue}
                            color="red"
                            isDeduction
                            icon={<Megaphone className="h-4 w-4" />}
                        />

                        {/* 3. Net Profit */}
                        <div className="pt-4 mt-2 border-t border-gray-800">
                            <FunnelStep
                                label="True Net Profit"
                                value={metrics.netProfit}
                                total={metrics.totalRevenue}
                                color={metrics.netProfit >= 0 ? "green" : "red"}
                                isFinal
                                icon={<CheckCircle2 className="h-4 w-4" />}
                            />
                        </div>
                    </div>
                </div>

                {/* Key Metrics Summary */}
                <div className="bg-[#1C1F26] rounded-xl border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-400" />
                        Profitability Overview
                    </h3>

                    <div className="grid grid-cols-1 gap-4">
                        {/* Gross Profit */}
                        <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Gross Profit</p>
                            <p className="text-2xl font-bold text-emerald-400">
                                {metrics.grossProfit.toFixed(2)} <span className="text-sm text-gray-500 font-medium">SAR</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Revenue - Product Costs</p>
                        </div>

                        {/* Total Expenses */}
                        <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Total Expenses</p>
                            <p className="text-2xl font-bold text-orange-400">
                                {metrics.totalExpenses.toFixed(2)} <span className="text-sm text-gray-500 font-medium">SAR</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">All business expenses</p>
                        </div>

                        {/* Net Profit */}
                        <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Net Profit</p>
                            <p className={`text-2xl font-bold ${metrics.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {metrics.netProfit.toFixed(2)} <span className="text-sm text-gray-500 font-medium">SAR</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Gross Profit - Fees - Expenses</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Marketing Performance */}
            {metrics.marketingExpenses > 0 && (
                <div className="bg-[#1C1F26] rounded-xl border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <Megaphone className="h-5 w-5 text-purple-400" />
                        Marketing Performance
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Marketing Spend</p>
                            <p className="text-xl font-bold text-white">
                                {metrics.marketingExpenses.toFixed(2)} <span className="text-xs text-gray-500">SAR</span>
                            </p>
                        </div>

                        <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">ROAS</p>
                            <p className="text-xl font-bold text-purple-400">
                                {metrics.roas === Infinity ? '∞' : metrics.roas.toFixed(2)}x
                            </p>
                        </div>

                        <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Break-even ROAS</p>
                            <p className="text-xl font-bold text-yellow-400">
                                {metrics.breakEvenRoas.toFixed(2)}x
                            </p>
                        </div>

                        <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Ad Spend % Revenue</p>
                            <p className="text-xl font-bold text-orange-400">
                                {metrics.adSpendPercent.toFixed(2)}%
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Insights */}
            <div className="space-y-3">
                {/* ROAS Warning */}
                {metrics.roas < 3 && metrics.marketingExpenses > 0 && (
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-orange-400">ROAS Below 3.0</p>
                            <p className="text-xs text-orange-400/80 mt-1">
                                Consider optimizing your ad campaigns or adjusting your marketing strategy
                            </p>
                        </div>
                    </div>
                )}

                {/* High Ad Spend Warning */}
                {metrics.adSpendPercent > 25 && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-red-400">High Ad Spend</p>
                            <p className="text-xs text-red-400/80 mt-1">
                                Marketing expenses exceed 25% of revenue. Review ad efficiency and targeting
                            </p>
                        </div>
                    </div>
                )}




            </div>

            {/* Source Data Verification */}
            <div className="bg-[#1C1F26] rounded-xl border border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gray-500/10 rounded-lg">
                        <Database className="h-5 w-5 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Source Data Verification</h3>
                </div>
                <p className="text-sm text-gray-500 mb-6 ml-14">
                    Original values used in all calculations above
                </p>

                {/* Volume Section */}
                <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Volume
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[#13151A] rounded-lg p-4 border border-gray-700/50">
                            <p className="text-xs text-gray-500 mb-1">Total Orders</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-xl font-bold text-white">
                                    {metrics.totalOrders.toLocaleString()}
                                </p>
                                <span className="text-sm text-gray-500">orders</span>
                            </div>
                        </div>
                        <div className="bg-[#13151A] rounded-lg p-4 border border-gray-700/50">
                            <p className="text-xs text-gray-500 mb-1">Total Revenue (Sales)</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-xl font-bold text-white">
                                    {metrics.totalRevenue.toFixed(2)}
                                </p>
                                <span className="text-sm text-gray-500">SAR</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Costs Section */}
                <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Costs
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-[#13151A] rounded-lg p-4 border border-gray-700/50">
                            <p className="text-xs text-gray-500 mb-1">Total Product Cost</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-xl font-bold text-white">
                                    {metrics.totalProductCost.toFixed(2)}
                                </p>
                                <span className="text-sm text-gray-500">SAR</span>
                            </div>
                        </div>
                        <div className="bg-[#13151A] rounded-lg p-4 border border-gray-700/50">
                            <p className="text-xs text-gray-500 mb-1">Total Shipping Fees</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-xl font-bold text-white">
                                    {metrics.totalShippingFees.toFixed(2)}
                                </p>
                                <span className="text-sm text-gray-500">SAR</span>
                            </div>
                        </div>
                        <div className="bg-[#13151A] rounded-lg p-4 border border-gray-700/50">
                            <p className="text-xs text-gray-500 mb-1">Total Payment Fees</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-xl font-bold text-white">
                                    {metrics.totalPaymentFees.toFixed(2)}
                                </p>
                                <span className="text-sm text-gray-500">SAR</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Expenses Section */}
                <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Expenses
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-[#13151A] rounded-lg p-4 border border-gray-700/50">
                            <p className="text-xs text-gray-500 mb-1">Total Expenses</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-xl font-bold text-white">
                                    {metrics.totalExpenses.toFixed(2)}
                                </p>
                                <span className="text-sm text-gray-500">SAR</span>
                            </div>
                        </div>
                        <div className="bg-[#13151A] rounded-lg p-4 border border-gray-700/50">
                            <p className="text-xs text-gray-500 mb-1">Marketing Expenses</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-xl font-bold text-white">
                                    {metrics.marketingExpenses.toFixed(2)}
                                </p>
                                <span className="text-sm text-gray-500">SAR</span>
                            </div>
                        </div>
                        <div className="bg-[#13151A] rounded-lg p-4 border border-gray-700/50">
                            <p className="text-xs text-gray-500 mb-1">Other Expenses</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-xl font-bold text-white">
                                    {(metrics.totalExpenses - metrics.marketingExpenses).toFixed(2)}
                                </p>
                                <span className="text-sm text-gray-500">SAR</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profit Summary Section */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Profit Summary
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[#13151A] rounded-lg p-4 border border-gray-700/50">
                            <p className="text-xs text-gray-500 mb-1">Gross Profit</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-xl font-bold text-emerald-400">
                                    {metrics.grossProfit.toFixed(2)}
                                </p>
                                <span className="text-sm text-gray-500">SAR</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Revenue - Product Cost</p>
                        </div>
                        <div className="bg-[#13151A] rounded-lg p-4 border border-gray-700/50">
                            <p className="text-xs text-gray-500 mb-1">Net Profit</p>
                            <div className="flex items-baseline gap-2">
                                <p className={`text-xl font-bold ${metrics.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {metrics.netProfit.toFixed(2)}
                                </p>
                                <span className="text-sm text-gray-500">SAR</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Earnings - Expenses</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper function to calculate all business metrics
function calculateBusinessMetrics(
    orders: Order[],
    expensesData: ExpensesData,
    expenses: Expense[]
): BusinessMetrics {
    // Basic volume metrics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    // Calculate product costs from orders
    const totalProductCost = orders.reduce((sum, order) => {
        return sum + order.items.reduce((itemSum, item) => {
            return itemSum + (item.product.cost * item.quantity);
        }, 0);
    }, 0);

    // Calculate fees
    const totalShippingFees = orders.reduce((sum, order) => {
        return sum + order.shippingMethod.cost;
    }, 0);

    const totalPaymentFees = orders.reduce((sum, order) => sum + order.paymentFees, 0);
    const totalFees = totalShippingFees + totalPaymentFees;

    // Marketing expenses (from expenses with category 'marketing')
    const marketingExpenses = expenses
        .filter(e => e.category === 'marketing')
        .reduce((sum, e) => sum + e.amount, 0);

    const totalExpenses = expensesData.totalExpenses;

    // Profit calculations
    const grossProfit = totalRevenue - totalProductCost;
    const netProfit = grossProfit - totalFees - expensesData.totalExpenses;

    // KPI calculations
    const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const productCostPercent = totalRevenue > 0 ? (totalProductCost / totalRevenue) * 100 : 0;
    const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const grossProfitPerOrder = totalOrders > 0 ? grossProfit / totalOrders : 0;
    const netProfitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const netProfitPerOrder = totalOrders > 0 ? netProfit / totalOrders : 0;
    const roas = marketingExpenses > 0 ? totalRevenue / marketingExpenses : Infinity;
    const adSpendPercent = totalRevenue > 0 ? (marketingExpenses / totalRevenue) * 100 : 0;
    const cpo = totalOrders > 0 ? totalExpenses / totalOrders : 0;
    const feeImpactPercent = totalRevenue > 0 ? (totalFees / totalRevenue) * 100 : 0;
    const breakEvenRoas = grossProfitMargin > 0 ? 100 / grossProfitMargin : 0;

    return {
        totalOrders,
        totalRevenue,
        totalProductCost,
        totalShippingFees,
        totalPaymentFees,
        totalFees,
        marketingExpenses,
        totalExpenses,
        grossProfit,
        netProfit,
        aov,
        productCostPercent,
        grossProfitMargin,
        grossProfitPerOrder,
        netProfitMargin,
        netProfitPerOrder,
        roas,
        adSpendPercent,
        cpo,
        feeImpactPercent,
        breakEvenRoas,
    };
}

// Reusable MetricCard component
interface MetricCardProps {
    label: string;
    value: string;
    unit: string;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'emerald' | 'teal' | 'amber' | 'yellow';
    subtitle?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, unit, icon, color, subtitle }) => {
    const colorClasses = {
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        green: 'text-green-400 bg-green-500/10 border-green-500/20',
        purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
        orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
        red: 'text-red-400 bg-red-500/10 border-red-500/20',
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        teal: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
        amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    };

    const textColor = colorClasses[color].split(' ')[0];

    return (
        <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
                <div className={`p-1.5 rounded-lg ${colorClasses[color]}`}>
                    {icon}
                </div>
            </div>
            <div className="flex items-baseline gap-2">
                <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
                <span className="text-sm text-gray-500 font-medium">{unit}</span>
            </div>
            {subtitle && (
                <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
        </div>
    );
};

// Funnel Step Component
interface FunnelStepProps {
    label: string;
    value: number;
    total: number;
    color: 'blue' | 'green' | 'orange' | 'red' | 'emerald';
    icon?: React.ReactNode;
    isDeduction?: boolean;
    isTotal?: boolean;
    isFinal?: boolean;
}

const FunnelStep: React.FC<FunnelStepProps> = ({
    label,
    value,
    total,
    color,
    icon,
    isDeduction,
    isTotal,
    isFinal
}) => {
    const percent = total > 0 ? (value / total) * 100 : 0;

    // Define color styles safely
    const styles = React.useMemo(() => {
        switch (color) {
            case 'blue': return { bg: 'bg-blue-500', text: 'text-blue-400', bar: 'bg-blue-500' };
            case 'green': return { bg: 'bg-green-500', text: 'text-green-400', bar: 'bg-green-500' };
            case 'emerald': return { bg: 'bg-emerald-500', text: 'text-emerald-400', bar: 'bg-emerald-500' };
            case 'orange': return { bg: 'bg-orange-500', text: 'text-orange-400', bar: 'bg-orange-500' };
            case 'red': return { bg: 'bg-red-500', text: 'text-red-400', bar: 'bg-red-500' };
            default: return { bg: 'bg-blue-500', text: 'text-blue-400', bar: 'bg-blue-500' };
        }
    }, [color]);

    return (
        <div className={`relative ${isFinal ? 'bg-green-500/5 p-4 rounded-lg border border-green-500/20' : ''}`}>
            {/* Connector Line */}
            {!isFinal && !isTotal && (
                <div className="absolute left-[19px] -top-4 bottom-6 w-0.5 bg-gray-800 -z-10" />
            )}

            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                    <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                        ${isDeduction ? 'bg-gray-800' : `${styles.bg}/10`}
                    `}>
                        {icon || (
                            <div className={`w-2 h-2 rounded-full ${styles.bg}`} />
                        )}
                    </div>
                    <div>
                        <p className={`text-sm font-medium ${isFinal ? 'text-lg text-white' : 'text-gray-400'}`}>
                            {label}
                        </p>
                        {isDeduction && (
                            <p className="text-xs text-gray-500">Deduction</p>
                        )}
                    </div>
                </div>
                <div className="text-right">
                    <p className={`font-bold ${isFinal ? 'text-2xl' : 'text-lg'} ${styles.text}`}>
                        {isDeduction ? '-' : ''}{value.toFixed(2)} <span className="text-xs text-gray-500">SAR</span>
                    </p>
                    <p className="text-xs text-gray-500">
                        {percent.toFixed(1)}% of Revenue
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className={`h-1.5 w-full bg-gray-800 rounded-full overflow-hidden mt-2 ${isFinal ? 'h-2' : ''}`}>
                <div
                    className={`h-full rounded-full ${styles.bar} ${isFinal ? 'animate-pulse' : ''}`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                />
            </div>
        </div>
    );
};
