import React from 'react';
import { Order } from '../../types';
import { Users } from 'lucide-react';
import { calculateTotalProfitShare } from '../../utils/profitSharing';

interface ProfitSharingReportProps {
  orders: Order[];
}

export const ProfitSharingReport: React.FC<ProfitSharingReportProps> = ({ orders }) => {
  // Calculate total profit sharing across all orders
  const totalShares = orders?.reduce((acc, order) => {
    const discountAmount = order.discount
      ? order.discount.type === 'percentage'
        ? (order.subtotal * order.discount.value) / 100
        : order.discount.value
      : 0;

    const profitSharing = calculateTotalProfitShare(
      order.items,
      order.shippingCost,
      order.paymentFees,
      discountAmount,
      order.isFreeShipping
    );

    return {
      yassirShare: acc.yassirShare + profitSharing.totalYassirShare,
      basimShare: acc.basimShare + profitSharing.totalBasimShare,
      totalProfit: acc.totalProfit + (profitSharing.totalYassirShare + profitSharing.totalBasimShare)
    };
  }, { yassirShare: 0, basimShare: 0, totalProfit: 0 });

  // Calculate percentages
  const yassirPercentage = totalShares ? (totalShares.yassirShare / totalShares.totalProfit) * 100 : 0;
  const basimPercentage = totalShares ? (totalShares.basimShare / totalShares.totalProfit) * 100 : 0;

  if (!orders?.length) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-6">
          <Users className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Total Profit Sharing</h2>
        </div>
        <p className="text-gray-500">No orders found to generate profit sharing report.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold">Total Profit Sharing</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Yassir's Share */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-800 mb-4">Yassir's Total Share</h3>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-blue-700">
              {totalShares?.yassirShare.toFixed(2)} SAR
            </p>
            <p className="text-sm text-blue-600">
              {yassirPercentage.toFixed(1)}% of total profit
            </p>
          </div>
        </div>

        {/* Basim's Share */}
        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-green-800 mb-4">Basim's Total Share</h3>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-green-700">
              {totalShares?.basimShare.toFixed(2)} SAR
            </p>
            <p className="text-sm text-green-600">
              {basimPercentage.toFixed(1)}% of total profit
            </p>
          </div>
        </div>
      </div>

      {/* Total Profit */}
      <div className="mt-6 bg-purple-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-purple-800 mb-4">Total Combined Profit</h3>
        <p className="text-3xl font-bold text-purple-700">
          {totalShares?.totalProfit.toFixed(2)} SAR
        </p>
      </div>

      {/* Order Count */}
      <div className="mt-6 text-gray-600 text-sm">
        Based on {orders.length} order{orders.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};