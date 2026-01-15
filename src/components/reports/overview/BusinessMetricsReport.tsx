import React from 'react';
import { Order } from '../../../types';
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
import { ReportMetrics } from '../../../utils/reportCalculations';

interface BusinessMetricsReportProps {
    orders: Order[];
    metrics: ReportMetrics | null;
}



export const BusinessMetricsReport: React.FC<BusinessMetricsReportProps> = ({
    orders,
    metrics
}) => {
    if (!orders?.length || !metrics) {
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

    // Calculate business-specific KPIs from centralized metrics
    const businessMetrics = {
        // Use metrics from centralized calculation
        totalOrders: metrics.totalOrders,
        totalRevenue: metrics.totalRevenue,
        aov: metrics.averageOrderValue,
        totalProductCost: metrics.totalProductCosts,
        totalShippingFees: metrics.totalShippingFees,
        totalPaymentFees: metrics.totalPaymentFees,
        totalFees: metrics.totalFees,
        marketingExpenses: metrics.marketingExpenses,
        totalExpenses: metrics.expenses.totalExpenses,
        grossProfit: metrics.grossProfit,
        netProfit: metrics.netProfit,
        productCostPercent: metrics.productCostPercent,
        grossProfitMargin: metrics.grossProfitMargin,
        grossProfitPerOrder: metrics.grossProfitPerOrder,
        netProfitMargin: metrics.netProfitMargin,
        netProfitPerOrder: metrics.netProfitPerOrder,
        feeImpactPercent: metrics.feeImpactPercent,

        // Calculate marketing-specific KPIs
        roas: metrics.marketingExpenses > 0 ? metrics.totalRevenue / metrics.marketingExpenses : 0,
        cpo: metrics.totalOrders > 0 ? metrics.marketingExpenses / metrics.totalOrders : 0,
        adSpendPercent: metrics.totalRevenue > 0 ? (metrics.marketingExpenses / metrics.totalRevenue) * 100 : 0,
        breakEvenRoas: metrics.marketingExpenses > 0
            ? metrics.totalRevenue / (metrics.totalRevenue - metrics.netProfit)
            : 0
    };

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
                    value={businessMetrics.aov.toFixed(2)}
                    unit="SAR"
                    icon={<ShoppingCart className="h-5 w-5" />}
                    color="blue"
                />

                {/* Total Orders */}
                <MetricCard
                    label="Total Orders"
                    value={businessMetrics.totalOrders.toString()}
                    unit="orders"
                    icon={<Target className="h-5 w-5" />}
                    color="green"
                />

                {/* Total Revenue */}
                <MetricCard
                    label="Total Revenue"
                    value={businessMetrics.totalRevenue.toFixed(2)}
                    unit="SAR"
                    icon={<DollarSign className="h-5 w-5" />}
                    color="emerald"
                />

                {/* ROAS */}
                <MetricCard
                    label="ROAS (Return on Ad Spend)"
                    value={businessMetrics.roas === Infinity ? '∞' : businessMetrics.roas.toFixed(2)}
                    unit="x"
                    icon={<Megaphone className="h-5 w-5" />}
                    color="purple"
                    subtitle={businessMetrics.marketingExpenses === 0 ? 'No ad spend' : undefined}
                />

                {/* Net Profit per Order */}
                <MetricCard
                    label="Net Profit per Order"
                    value={businessMetrics.netProfitPerOrder.toFixed(2)}
                    unit="SAR"
                    icon={<TrendingUp className="h-5 w-5" />}
                    color={businessMetrics.netProfitPerOrder >= 0 ? 'green' : 'red'}
                />

                {/* Gross Profit Margin */}
                <MetricCard
                    label="Gross Profit Margin"
                    value={businessMetrics.grossProfitMargin.toFixed(2)}
                    unit="%"
                    icon={<Percent className="h-5 w-5" />}
                    color="teal"
                />

                {/* Ad Spend % of Revenue */}
                <MetricCard
                    label="Ad Spend % of Revenue"
                    value={businessMetrics.adSpendPercent.toFixed(2)}
                    unit="%"
                    icon={<Megaphone className="h-5 w-5" />}
                    color="orange"
                />

                {/* Product Cost % */}
                <MetricCard
                    label="Product Cost %"
                    value={businessMetrics.productCostPercent.toFixed(2)}
                    unit="%"
                    icon={<TrendingDown className="h-5 w-5" />}
                    color="amber"
                />

                {/* Gross Profit per Order */}
                <MetricCard
                    label="Gross Profit per Order"
                    value={businessMetrics.grossProfitPerOrder.toFixed(2)}
                    unit="SAR"
                    icon={<DollarSign className="h-5 w-5" />}
                    color="green"
                />

                {/* Cost Per Order (CPO) */}
                <MetricCard
                    label="Cost Per Order (CPO)"
                    value={businessMetrics.cpo.toFixed(2)}
                    unit="SAR"
                    icon={<TrendingDown className="h-5 w-5" />}
                    color="orange"
                />

                {/* Net Profit Margin */}
                <MetricCard
                    label="Net Profit Margin"
                    value={businessMetrics.netProfitMargin.toFixed(2)}
                    unit="%"
                    icon={<Percent className="h-5 w-5" />}
                    color={businessMetrics.netProfitMargin >= 0 ? 'green' : 'red'}
                />

                {/* Fee Impact % */}
                <MetricCard
                    label="Total Fee Impact"
                    value={businessMetrics.feeImpactPercent.toFixed(2)}
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
                            value={businessMetrics.totalRevenue}
                            total={businessMetrics.totalRevenue}
                            color="blue"
                            icon={<DollarSign className="h-4 w-4" />}
                            isTotal
                        />

                        {/* Deduct Product Costs */}
                        <FunnelStep
                            label="Product Costs"
                            value={businessMetrics.totalProductCost}
                            total={businessMetrics.totalRevenue}
                            color="orange"
                            isDeduction
                            icon={<ShoppingBag className="h-4 w-4" />}
                        />

                        {/* 2. Gross Profit */}
                        <FunnelStep
                            label="Gross Profit"
                            value={businessMetrics.grossProfit}
                            total={businessMetrics.totalRevenue}
                            color="emerald"
                        />

                        {/* Deduct Fees */}
                        <FunnelStep
                            label="Shipping & Payment Fees"
                            value={businessMetrics.totalFees}
                            total={businessMetrics.totalRevenue}
                            color="red"
                            isDeduction
                            icon={<AlertCircle className="h-4 w-4" />}
                        />

                        {/* Deduct Expenses */}
                        <FunnelStep
                            label="Operating Expenses"
                            value={businessMetrics.totalExpenses}
                            total={businessMetrics.totalRevenue}
                            color="red"
                            isDeduction
                            icon={<Megaphone className="h-4 w-4" />}
                        />

                        {/* 3. Net Profit */}
                        <div className="pt-4 mt-2 border-t border-gray-800">
                            <FunnelStep
                                label="True Net Profit"
                                value={businessMetrics.netProfit}
                                total={businessMetrics.totalRevenue}
                                color={businessMetrics.netProfit >= 0 ? "green" : "red"}
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
                                {businessMetrics.grossProfit.toFixed(2)} <span className="text-sm text-gray-500 font-medium">SAR</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Revenue - Product Costs</p>
                        </div>

                        {/* Total Expenses */}
                        <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Total Expenses</p>
                            <p className="text-2xl font-bold text-orange-400">
                                {businessMetrics.totalExpenses.toFixed(2)} <span className="text-sm text-gray-500 font-medium">SAR</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">All business expenses</p>
                        </div>

                        {/* Net Profit */}
                        <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Net Profit</p>
                            <p className={`text-2xl font-bold ${businessMetrics.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {businessMetrics.netProfit.toFixed(2)} <span className="text-sm text-gray-500 font-medium">SAR</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Gross Profit - Fees - Expenses</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Marketing Performance */}
            {businessMetrics.marketingExpenses > 0 && (
                <div className="bg-[#1C1F26] rounded-xl border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <Megaphone className="h-5 w-5 text-purple-400" />
                        Marketing Performance
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Marketing Spend</p>
                            <p className="text-xl font-bold text-white">
                                {businessMetrics.marketingExpenses.toFixed(2)} <span className="text-xs text-gray-500">SAR</span>
                            </p>
                        </div>

                        <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">ROAS</p>
                            <p className="text-xl font-bold text-purple-400">
                                {businessMetrics.roas === Infinity ? '∞' : businessMetrics.roas.toFixed(2)}x
                            </p>
                        </div>

                        <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Break-even ROAS</p>
                            <p className="text-xl font-bold text-yellow-400">
                                {businessMetrics.breakEvenRoas.toFixed(2)}x
                            </p>
                        </div>

                        <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Ad Spend % Revenue</p>
                            <p className="text-xl font-bold text-orange-400">
                                {businessMetrics.adSpendPercent.toFixed(2)}%
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Insights */}
            <div className="space-y-3">
                {/* ROAS Warning */}
                {businessMetrics.roas < 3 && businessMetrics.marketingExpenses > 0 && (
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
                {businessMetrics.adSpendPercent > 25 && (
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
                                    {businessMetrics.totalOrders.toLocaleString()}
                                </p>
                                <span className="text-sm text-gray-500">orders</span>
                            </div>
                        </div>
                        <div className="bg-[#13151A] rounded-lg p-4 border border-gray-700/50">
                            <p className="text-xs text-gray-500 mb-1">Total Revenue (Sales)</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-xl font-bold text-white">
                                    {businessMetrics.totalRevenue.toFixed(2)}
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
                                    {businessMetrics.totalProductCost.toFixed(2)}
                                </p>
                                <span className="text-sm text-gray-500">SAR</span>
                            </div>
                        </div>
                        <div className="bg-[#13151A] rounded-lg p-4 border border-gray-700/50">
                            <p className="text-xs text-gray-500 mb-1">Total Shipping Fees</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-xl font-bold text-white">
                                    {businessMetrics.totalShippingFees.toFixed(2)}
                                </p>
                                <span className="text-sm text-gray-500">SAR</span>
                            </div>
                        </div>
                        <div className="bg-[#13151A] rounded-lg p-4 border border-gray-700/50">
                            <p className="text-xs text-gray-500 mb-1">Total Payment Fees</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-xl font-bold text-white">
                                    {businessMetrics.totalPaymentFees.toFixed(2)}
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
                                    {businessMetrics.totalExpenses.toFixed(2)}
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
                                    {(businessMetrics.totalExpenses - metrics.marketingExpenses).toFixed(2)}
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
