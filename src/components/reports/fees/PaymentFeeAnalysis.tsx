import React from 'react';
import { Order } from '../../../types';
import { CreditCard, TrendingUp, DollarSign, Percent, Wallet } from 'lucide-react';

interface PaymentFeeData {
    totalPaymentFees: number;
    averagePaymentFee: number;
    totalRevenue: number;
    feesAsPercentOfRevenue: number;
    averageFeePercentage: number;
    byMethod: Array<{
        methodName: string;
        orderCount: number;
        totalFees: number;
        averageFee: number;
    }>;
}

interface PaymentFeeAnalysisProps {
    orders: Order[];
    paymentFeeData: PaymentFeeData | null;
}

export const PaymentFeeAnalysis: React.FC<PaymentFeeAnalysisProps> = ({
    orders,
    paymentFeeData
}) => {
    if (!orders?.length || !paymentFeeData) {
        return (
            <div className="bg-[#1C1F26] rounded-xl border border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                        <CreditCard className="h-6 w-6 text-purple-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">Payment Fee Analysis</h2>
                </div>
                <p className="text-gray-500">No data available.</p>
            </div>
        );
    }

    return (
        <div className="bg-[#1C1F26] rounded-xl border border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                    <CreditCard className="h-6 w-6 text-purple-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Payment Fee Analysis</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Total Payment Fees */}
                <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Total Fees Paid</span>
                        <DollarSign className="h-4 w-4 text-red-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">
                        {paymentFeeData.totalPaymentFees.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">SAR</p>
                </div>

                {/* Average Payment Fee */}
                <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Avg Per Order</span>
                        <TrendingUp className="h-4 w-4 text-purple-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">
                        {paymentFeeData.averagePaymentFee.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">SAR</p>
                </div>

                {/* Fees as % of Revenue */}
                <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">% of Revenue</span>
                        <Percent className="h-4 w-4 text-orange-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">
                        {paymentFeeData.feesAsPercentOfRevenue.toFixed(2)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Impact</p>
                </div>

                {/* Average Fee Rate */}
                <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Avg Fee Rate</span>
                        <CreditCard className="h-4 w-4 text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">
                        {paymentFeeData.averageFeePercentage.toFixed(2)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Per Transaction</p>
                </div>
            </div>

            {/* Payment Method Breakdown */}
            {paymentFeeData.byMethod.length > 0 && (
                <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800 mb-6">
                    <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        Breakdown by Payment Method
                    </h3>

                    <div className="space-y-3">
                        {paymentFeeData.byMethod.map((method, index) => (
                            <div key={index} className="bg-[#1C1F26] rounded-lg p-4 border border-gray-700/50">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="text-sm font-semibold text-white">{method.methodName}</h4>
                                        <p className="text-xs text-gray-500 mt-1">{method.orderCount} orders</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-purple-400">{method.totalFees.toFixed(2)} SAR</p>
                                        <p className="text-xs text-gray-500">Total fees</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-gray-700/30">
                                    <span className="text-xs text-gray-400">Average per order</span>
                                    <span className="text-sm font-medium text-white">{method.averageFee.toFixed(2)} SAR</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Cost Breakdown */}
            <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Cost Impact</h3>

                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Total Revenue</span>
                        <span className="text-base font-medium text-white">
                            {paymentFeeData.totalRevenue.toFixed(2)} SAR
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Payment Fees</span>
                        <span className="text-base font-medium text-red-400">
                            -{paymentFeeData.totalPaymentFees.toFixed(2)} SAR
                        </span>
                    </div>
                    <div className="border-t border-gray-700/50 pt-3 flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-300">Net After Fees</span>
                        <span className="text-lg font-bold text-green-400">
                            {(paymentFeeData.totalRevenue - paymentFeeData.totalPaymentFees).toFixed(2)} SAR
                        </span>
                    </div>
                </div>
            </div>

            {/* Insights */}
            <div className="mt-4 space-y-3">
                {paymentFeeData.averageFeePercentage > 3 && (
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                        <p className="text-sm text-orange-400">
                            ⚠️ Average payment fee rate is above 3%. Consider switching to a payment provider with lower fees.
                        </p>
                    </div>
                )}

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <p className="text-sm text-blue-400">
                        💡 Based on {orders.length} orders, you're paying an average of {paymentFeeData.averagePaymentFee.toFixed(2)} SAR in payment fees per order.
                    </p>
                </div>
            </div>
        </div>
    );
};
