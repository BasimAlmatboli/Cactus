import React from 'react';
import { Order } from '../../../types';
import { DollarSign } from 'lucide-react';

interface FinancialReportProps {
  orders: Order[];
}

export const FinancialReport: React.FC<FinancialReportProps> = ({ orders }) => {
  const totalRevenue = orders?.reduce((sum, order) => sum + order.total, 0) || 0;
  const totalCosts = orders?.reduce((sum, order) => {
    const productCosts = order.items.reduce(
      (itemSum, item) => itemSum + item.product.cost * item.quantity,
      0
    );
    return sum + productCosts + order.shippingCost + order.paymentFees;
  }, 0) || 0;

  const totalDiscounts = orders?.reduce((sum, order) => {
    if (!order.discount) return sum;
    const discountAmount = order.discount.type === 'percentage'
      ? (order.subtotal * order.discount.value) / 100
      : order.discount.value;
    return sum + discountAmount;
  }, 0) || 0;

  const totalOrderProfit = orders?.reduce((sum, order) => sum + order.netProfit, 0) || 0;

  if (!orders?.length) {
    return (
      <div className="bg-[#1C1F26] rounded-xl border border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <DollarSign className="h-6 w-6 text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Financial Report</h2>
        </div>
        <p className="text-gray-500">No orders found to generate financial report.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1C1F26] rounded-xl border border-gray-800 p-6">
      <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <DollarSign className="h-6 w-6 text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">Financial Report</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-[#13151A] rounded-xl p-5 border border-green-500/20 group hover:border-green-500/40 transition-colors">
            <h3 className="text-sm font-medium text-green-400 mb-2 uppercase tracking-wider">Total Revenue</h3>
            <p className="text-3xl font-bold text-white">{totalRevenue.toFixed(2)} <span className="text-lg text-gray-500 font-medium">SAR</span></p>
          </div>

          <div className="bg-[#13151A] rounded-xl p-5 border border-red-500/20 group hover:border-red-500/40 transition-colors">
            <h3 className="text-sm font-medium text-red-400 mb-2 uppercase tracking-wider">Total Costs</h3>
            <p className="text-3xl font-bold text-white">{totalCosts.toFixed(2)} <span className="text-lg text-gray-500 font-medium">SAR</span></p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[#13151A] rounded-xl p-5 border border-orange-500/20 group hover:border-orange-500/40 transition-colors">
            <h3 className="text-sm font-medium text-orange-400 mb-2 uppercase tracking-wider">Total Discounts</h3>
            <p className="text-3xl font-bold text-white">{totalDiscounts.toFixed(2)} <span className="text-lg text-gray-500 font-medium">SAR</span></p>
          </div>

          <div className="bg-[#13151A] rounded-xl p-5 border border-blue-500/20 group hover:border-blue-500/40 transition-colors">
            <h3 className="text-sm font-medium text-blue-400 mb-2 uppercase tracking-wider">Total Order Profit</h3>
            <p className="text-3xl font-bold text-white">{totalOrderProfit.toFixed(2)} <span className="text-lg text-gray-500 font-medium">SAR</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};