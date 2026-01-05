import React, { useState, useEffect } from 'react';
import { Order } from '../../types';
import { calculateTotalEarnings } from '../../utils/profitSharing';
import { calculateTotalProfitShare } from '../../utils/profitSharing';
import { Wallet } from 'lucide-react';

interface TotalEarningsReportProps {
  orders: Order[];
}

export const TotalEarningsReport: React.FC<TotalEarningsReportProps> = ({ orders }) => {
  const [totalEarningsData, setTotalEarningsData] = useState<any>(null);

  useEffect(() => {
    const calculateEarnings = async () => {
      if (!orders?.length) {
        setTotalEarningsData(null);
        return;
      }

      const earnings = {
        yassirProductsCost: 0,
        basimProductsCost: 0,
        yassirTotalEarnings: 0,
        basimTotalEarnings: 0,
        combinedTotalEarnings: 0,
      };

      for (const order of orders) {
        const discountAmount = order.discount
          ? order.discount.type === 'percentage'
            ? (order.subtotal * order.discount.value) / 100
            : order.discount.value
          : 0;

        const profitSharing = await calculateTotalProfitShare(
          order.items,
          order.shippingCost,
          order.paymentFees,
          discountAmount,
          order.isFreeShipping
        );

        const orderEarnings = calculateTotalEarnings(
          order.items,
          profitSharing.totalYassirShare,
          profitSharing.totalBasimShare
        );

        earnings.yassirProductsCost += orderEarnings.yassirProductsCost;
        earnings.basimProductsCost += orderEarnings.basimProductsCost;
        earnings.yassirTotalEarnings += orderEarnings.yassirTotalEarnings;
        earnings.basimTotalEarnings += orderEarnings.basimTotalEarnings;
        earnings.combinedTotalEarnings += orderEarnings.combinedTotalEarnings;
      }

      setTotalEarningsData(earnings);
    };

    calculateEarnings();
  }, [orders]);

  if (!orders?.length) {
    return (
      <div className="bg-[#1C1F26] rounded-xl border border-gray-800 p-6 h-full">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Wallet className="h-6 w-6 text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Total Earnings</h2>
        </div>
        <p className="text-gray-500">No orders found.</p>
      </div>
    );
  }

  if (!totalEarningsData) {
    return (
      <div className="bg-[#1C1F26] rounded-xl border border-gray-800 p-6 h-full">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Wallet className="h-6 w-6 text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Total Earnings</h2>
        </div>
        <p className="text-gray-500">Calculating earnings...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1C1F26] rounded-xl border border-gray-800 p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <Wallet className="h-6 w-6 text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">Total Earnings</h2>
      </div>

      <div className="space-y-4 mb-6 flex-1">
        {/* Yassir's Earnings */}
        <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800">
          <h3 className="text-sm font-medium text-blue-400 mb-3 uppercase tracking-wider">Yassir's Earnings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wide">Costs</span>
              <span className="block text-lg font-medium text-gray-300">{totalEarningsData.yassirProductsCost.toFixed(2)} SAR</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wide">Net Earnings</span>
              <span className="block text-lg font-bold text-white">{totalEarningsData.yassirTotalEarnings.toFixed(2)} SAR</span>
            </div>
          </div>
        </div>

        {/* Basim's Earnings */}
        <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800">
          <h3 className="text-sm font-medium text-green-400 mb-3 uppercase tracking-wider">Basim's Earnings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wide">Costs</span>
              <span className="block text-lg font-medium text-gray-300">{totalEarningsData.basimProductsCost.toFixed(2)} SAR</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wide">Net Earnings</span>
              <span className="block text-lg font-bold text-white">{totalEarningsData.basimTotalEarnings.toFixed(2)} SAR</span>
            </div>
          </div>
        </div>
      </div>

      {/* Combined Total */}
      <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl p-5 border border-purple-500/20">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-medium text-purple-300 mb-1">Combined Earnings</h3>
            <p className="text-xs text-purple-400/60">Based on {orders.length} orders</p>
          </div>
          <div className="text-3xl font-bold text-purple-300">
            {totalEarningsData.combinedTotalEarnings.toFixed(2)} <span className="text-lg text-purple-400/60 font-medium">SAR</span>
          </div>
        </div>
      </div>
    </div>
  );
};