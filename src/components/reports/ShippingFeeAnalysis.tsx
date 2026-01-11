import React from 'react';
import { Order } from '../../types';
import { Ship, TrendingUp, TrendingDown, DollarSign, Package } from 'lucide-react';

interface ShippingFeeData {
    totalShippingFees: number;
    freeShippingCount: number;
    paidShippingCount: number;
    averageShippingFee: number;
    totalRevenue: number;
    feesAsPercentOfRevenue: number;
    byCompany: Array<{
        companyName: string;
        orderCount: number;
        totalFees: number;
        averageFee: number;
    }>;
}

interface ShippingFeeAnalysisProps {
    orders: Order[];
    shippingFeeData: ShippingFeeData | null;
}

export const ShippingFeeAnalysis: React.FC<ShippingFeeAnalysisProps> = ({
    orders,
    shippingFeeData
}) => {
    if (!orders?.length || !shippingFeeData) {
        return (
            <div className="bg-[#1C1F26] rounded-xl border border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Ship className="h-6 w-6 text-blue-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">Shipping Fee Analysis</h2>
                </div>
                <p className="text-gray-500">No data available.</p>
            </div>
        );
    }

    const freeShippingPercentage = (shippingFeeData.freeShippingCount / orders.length) * 100;
    const paidShippingPercentage = (shippingFeeData.paidShippingCount / orders.length) * 100;

    return (
        <div className="bg-[#1C1F26] rounded-xl border border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Ship className="h-6 w-6 text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Shipping Fee Analysis</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Total Shipping Fees */}
                <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Total Fees Paid</span>
                        <DollarSign className="h-4 w-4 text-red-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">
                        {shippingFeeData.totalShippingFees.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">SAR</p>
                </div>

                {/* Average Shipping Fee */}
                <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Avg Per Order</span>
                        <TrendingUp className="h-4 w-4 text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">
                        {shippingFeeData.averageShippingFee.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">SAR</p>
                </div>

                {/* Fees as % of Revenue */}
                <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">% of Revenue</span>
                        <TrendingDown className="h-4 w-4 text-orange-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">
                        {shippingFeeData.feesAsPercentOfRevenue.toFixed(2)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Impact</p>
                </div>

                {/* Total Orders */}
                <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Total Orders</span>
                        <Ship className="h-4 w-4 text-green-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">
                        {orders.length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Orders</p>
                </div>
            </div>

            {/* Shipping Company Breakdown */}
            {shippingFeeData.byCompany.length > 0 && (
                <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800 mb-6">
                    <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Breakdown by Shipping Company
                    </h3>

                    <div className="space-y-3">
                        {shippingFeeData.byCompany.map((company, index) => (
                            <div key={index} className="bg-[#1C1F26] rounded-lg p-4 border border-gray-700/50">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="text-sm font-semibold text-white">{company.companyName}</h4>
                                        <p className="text-xs text-gray-500 mt-1">{company.orderCount} orders</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-blue-400">{company.totalFees.toFixed(2)} SAR</p>
                                        <p className="text-xs text-gray-500">Total fees</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-gray-700/30">
                                    <span className="text-xs text-gray-400">Average per order</span>
                                    <span className="text-sm font-medium text-white">{company.averageFee.toFixed(2)} SAR</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Shipping Type Breakdown */}
            <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Shipping Type Breakdown</h3>

                <div className="space-y-4">
                    {/* Free Shipping */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-400">Free Shipping</span>
                            <span className="text-sm font-medium text-green-400">
                                {shippingFeeData.freeShippingCount} orders ({freeShippingPercentage.toFixed(1)}%)
                            </span>
                        </div>
                        <div className="w-full bg-gray-700/50 rounded-full h-2">
                            <div
                                className="bg-green-500 h-2 rounded-full transition-all"
                                style={{ width: `${freeShippingPercentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Paid Shipping */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-400">Paid Shipping</span>
                            <span className="text-sm font-medium text-blue-400">
                                {shippingFeeData.paidShippingCount} orders ({paidShippingPercentage.toFixed(1)}%)
                            </span>
                        </div>
                        <div className="w-full bg-gray-700/50 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all"
                                style={{ width: `${paidShippingPercentage}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Insights */}
            {shippingFeeData.feesAsPercentOfRevenue > 10 && (
                <div className="mt-4 bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                    <p className="text-sm text-orange-400">
                        ⚠️ Shipping fees are over 10% of revenue. Consider negotiating better shipping rates or adjusting pricing.
                    </p>
                </div>
            )}
        </div>
    );
};
