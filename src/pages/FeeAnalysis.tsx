import { useState, useEffect } from 'react';
import { getOrders } from '../data/orders';
import { Order } from '../types';
import { ShippingFeeAnalysis } from '../components/reports/ShippingFeeAnalysis';
import { PaymentFeeAnalysis } from '../components/reports/PaymentFeeAnalysis';
import { Loader2 } from 'lucide-react';

interface ShippingFeeData {
    totalShippingFees: number;
    freeShippingCount: number;
    paidShippingCount: number;
    averageShippingFee: number;
    totalRevenue: number;
    feesAsPercentOfRevenue: number;
}

interface PaymentFeeData {
    totalPaymentFees: number;
    averagePaymentFee: number;
    totalRevenue: number;
    feesAsPercentOfRevenue: number;
    averageFeePercentage: number;
}

export const FeeAnalysis = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [shippingFeeData, setShippingFeeData] = useState<ShippingFeeData | null>(null);
    const [paymentFeeData, setPaymentFeeData] = useState<PaymentFeeData | null>(null);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const loadedOrders = await getOrders();
            setOrders(loadedOrders);

            // Calculate fees once after orders are loaded
            calculateFees(loadedOrders);
        } catch (error) {
            console.error('Error loading orders:', error);
            setError('Failed to load fee analysis. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const calculateFees = (ordersList: Order[]) => {
        if (!ordersList?.length) {
            setShippingFeeData(null);
            setPaymentFeeData(null);
            return;
        }

        let totalShippingFees = 0;
        let totalPaymentFees = 0;
        let freeShippingCount = 0;
        let paidShippingCount = 0;
        let totalRevenue = 0;

        ordersList.forEach(order => {
            // Shipping fees
            if (order.isFreeShipping) {
                freeShippingCount++;
            } else {
                paidShippingCount++;
                totalShippingFees += order.shippingCost;
            }

            // Payment fees
            totalPaymentFees += order.paymentFees;

            // Revenue (total from order)
            totalRevenue += order.total;
        });

        // Shipping fee data
        setShippingFeeData({
            totalShippingFees,
            freeShippingCount,
            paidShippingCount,
            averageShippingFee: paidShippingCount > 0 ? totalShippingFees / paidShippingCount : 0,
            totalRevenue,
            feesAsPercentOfRevenue: totalRevenue > 0 ? (totalShippingFees / totalRevenue) * 100 : 0,
        });

        // Payment fee data
        setPaymentFeeData({
            totalPaymentFees,
            averagePaymentFee: totalPaymentFees / ordersList.length,
            totalRevenue,
            feesAsPercentOfRevenue: totalRevenue > 0 ? (totalPaymentFees / totalRevenue) * 100 : 0,
            averageFeePercentage: totalRevenue > 0 ? (totalPaymentFees / totalRevenue) * 100 : 0,
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0F1115]">
                <div className="flex items-center space-x-2 text-blue-500">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading fee analysis...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-8 bg-[#0F1115] min-h-screen">
                <div className="max-w-[1600px] px-6">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-2 pb-32">
            <div className="max-w-[1600px] px-6">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Fee Analysis</h1>
                        <p className="text-gray-400 mt-2">Analyze shipping and payment processing fees</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ShippingFeeAnalysis
                            orders={orders}
                            shippingFeeData={shippingFeeData}
                        />
                        <PaymentFeeAnalysis
                            orders={orders}
                            paymentFeeData={paymentFeeData}
                        />
                    </div>

                    {/* Combined Fee Summary */}
                    {shippingFeeData && paymentFeeData && (
                        <div className="bg-[#1C1F26] rounded-xl border border-gray-800 p-6">
                            <h2 className="text-xl font-semibold text-white mb-6">Combined Fee Summary</h2>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Total Fees</p>
                                    <p className="text-2xl font-bold text-white">
                                        {(shippingFeeData.totalShippingFees + paymentFeeData.totalPaymentFees).toFixed(2)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">SAR</p>
                                </div>

                                <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Shipping Fees</p>
                                    <p className="text-2xl font-bold text-blue-400">
                                        {shippingFeeData.totalShippingFees.toFixed(2)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">SAR</p>
                                </div>

                                <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Payment Fees</p>
                                    <p className="text-2xl font-bold text-purple-400">
                                        {paymentFeeData.totalPaymentFees.toFixed(2)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">SAR</p>
                                </div>

                                <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">% of Revenue</p>
                                    <p className="text-2xl font-bold text-orange-400">
                                        {((shippingFeeData.totalShippingFees + paymentFeeData.totalPaymentFees) / shippingFeeData.totalRevenue * 100).toFixed(2)}%
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">Impact</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
