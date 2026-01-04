import React, { useState, useEffect } from 'react';
import { Order } from '../../types';
import { Users } from 'lucide-react';
import { calculateTotalProfitShare } from '../../utils/profitSharing';

interface ProfitSharingReportProps {
  orders: Order[];
}

export const ProfitSharingReport: React.FC<ProfitSharingReportProps> = ({ orders }) => {
  const [totalShares, setTotalShares] = useState<{
    yassirShare: number;
    basimShare: number;
    totalProfit: number;
  } | null>(null);

  useEffect(() => {
    const calculateShares = async () => {
      if (!orders?.length) {
        setTotalShares(null);
        return;
      }

      const shares = { yassirShare: 0, basimShare: 0, totalProfit: 0 };

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

        shares.yassirShare += profitSharing.totalYassirShare;
        shares.basimShare += profitSharing.totalBasimShare;
        shares.totalProfit += profitSharing.totalYassirShare + profitSharing.totalBasimShare;
      }

      setTotalShares(shares);
    };

    calculateShares();
  }, [orders]);

  // Calculate percentages
  const yassirPercentage = totalShares ? (totalShares.yassirShare / totalShares.totalProfit) * 100 : 0;
  const basimPercentage = totalShares ? (totalShares.basimShare / totalShares.totalProfit) * 100 : 0;

  if (!orders?.length) {
    return (
      <div className="bg-[#1C1F26] rounded-xl border border-gray-800 p-6 h-full">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Users className="h-6 w-6 text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Profit Sharing</h2>
        </div>
        <p className="text-gray-500">No orders found.</p>
      </div>
    );
  }

  if (!totalShares) {
    return (
      <div className="bg-[#1C1F26] rounded-xl border border-gray-800 p-6 h-full">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Users className="h-6 w-6 text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Profit Sharing</h2>
        </div>
        <p className="text-gray-500">Calculating shares...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1C1F26] rounded-xl border border-gray-800 p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <Users className="h-6 w-6 text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">Profit Sharing</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 flex-1">
        {/* Yassir's Share */}
        <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800 relative overflow-hidden group hover:border-blue-500/30 transition-colors">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="h-24 w-24 text-blue-500 transform translate-x-4 -translate-y-4" />
          </div>
          <h3 className="text-sm font-medium text-blue-400 mb-2 uppercase tracking-wider">Yassir's Share</h3>
          <div className="relative z-10">
            <p className="text-2xl font-bold text-white mb-1">
              {totalShares.yassirShare.toFixed(2)} SAR
            </p>
            <p className="text-xs text-blue-400/80 font-medium bg-blue-500/10 inline-block px-2 py-1 rounded-full border border-blue-500/20">
              {yassirPercentage.toFixed(1)}% of profit
            </p>
          </div>
        </div>

        {/* Basim's Share */}
        <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800 relative overflow-hidden group hover:border-green-500/30 transition-colors">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="h-24 w-24 text-green-500 transform translate-x-4 -translate-y-4" />
          </div>
          <h3 className="text-sm font-medium text-green-400 mb-2 uppercase tracking-wider">Basim's Share</h3>
          <div className="relative z-10">
            <p className="text-2xl font-bold text-white mb-1">
              {totalShares.basimShare.toFixed(2)} SAR
            </p>
            <p className="text-xs text-green-400/80 font-medium bg-green-500/10 inline-block px-2 py-1 rounded-full border border-green-500/20">
              {basimPercentage.toFixed(1)}% of profit
            </p>
          </div>
        </div>
      </div>

      {/* Total Profit */}
      <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-xl p-5 border border-indigo-500/20">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-medium text-indigo-300 mb-1">Total Combined Profit</h3>
            <p className="text-xs text-indigo-400/60">Based on {orders.length} orders</p>
          </div>
          <p className="text-3xl font-bold text-indigo-300">
            {totalShares.totalProfit.toFixed(2)} <span className="text-lg text-indigo-400/60 font-medium">SAR</span>
          </p>
        </div>
      </div>
    </div>
  );
};