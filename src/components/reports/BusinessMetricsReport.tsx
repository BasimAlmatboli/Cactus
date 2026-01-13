import React from 'react';
import { Order } from '../../types';
import { Expense } from '../../types/expense';
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
    Megaphone
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
    const metrics = calculateBusinessMetrics(orders, earningsData, expensesData, expenses);

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
            <div className="bg-[#1C1F26] rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                    Profitability Overview
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        <p className="text-xs text-gray-500 mt-1">Gross Profit - Expenses</p>
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

                {/* Healthy Gross Margin */}
                {metrics.grossProfitMargin > 40 && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-green-400">Healthy Gross Margin</p>
                            <p className="text-xs text-green-400/80 mt-1">
                                Gross profit margin above 40% indicates strong product profitability
                            </p>
                        </div>
                    </div>
                )}

                {/* High Fee Impact */}
                {metrics.feeImpactPercent > 10 && (
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-orange-400">High Fee Impact</p>
                            <p className="text-xs text-orange-400/80 mt-1">
                                Shipping and payment fees exceed 10% of revenue. Consider negotiating better rates
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper function to calculate all business metrics
function calculateBusinessMetrics(
    orders: Order[],
    earningsData: EarningsData,
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
        return sum + (order.isFreeShipping ? 0 : order.shippingCost);
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
    const netProfit = earningsData.combinedTotalEarnings - expensesData.totalExpenses;

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
