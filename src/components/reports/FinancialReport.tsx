import React from 'react';
import { Order } from '../../types';
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

  const totalProfit = orders?.reduce((sum, order) => sum + order.netProfit, 0) || 0;

  if (!orders?.length) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-6">
          <DollarSign className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Financial Report</h2>
        </div>
        <p className="text-gray-500">No orders found to generate financial report.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <DollarSign className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold">Financial Report</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-600 mb-1">Total Revenue</h3>
            <p className="text-2xl font-bold text-green-700">{totalRevenue.toFixed(2)} SAR</p>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-red-600 mb-1">Total Costs</h3>
            <p className="text-2xl font-bold text-red-700">{totalCosts.toFixed(2)} SAR</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-orange-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-orange-600 mb-1">Total Discounts</h3>
            <p className="text-2xl font-bold text-orange-700">{totalDiscounts.toFixed(2)} SAR</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-600 mb-1">Net Profit</h3>
            <p className="text-2xl font-bold text-blue-700">{totalProfit.toFixed(2)} SAR</p>
          </div>
        </div>
      </div>
    </div>
  );
};