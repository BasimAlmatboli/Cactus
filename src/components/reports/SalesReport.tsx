import React from 'react';
import { Order } from '../../types';
import { TrendingUp } from 'lucide-react';

interface SalesReportProps {
  orders: Order[];
}

export const SalesReport: React.FC<SalesReportProps> = ({ orders }) => {
  const totalSales = orders?.reduce((sum, order) => sum + order.total, 0) || 0;
  const totalOrders = orders?.length || 0;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  if (!orders?.length) {
    return (
      <div className="bg-[#1C1F26] rounded-xl border border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <TrendingUp className="h-6 w-6 text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Sales Report</h2>
        </div>
        <p className="text-gray-500">No orders found.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1C1F26] rounded-xl border border-gray-800 p-6">
      <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <TrendingUp className="h-6 w-6 text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">Sales Report</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#13151A] rounded-xl p-5 border border-blue-500/20 group hover:border-blue-500/40 transition-colors">
          <h3 className="text-sm font-medium text-blue-400 mb-2 uppercase tracking-wider">Total Sales</h3>
          <p className="text-2xl font-bold text-white">{totalSales.toFixed(2)} <span className="text-lg text-gray-500 font-medium">SAR</span></p>
        </div>

        <div className="bg-[#13151A] rounded-xl p-5 border border-green-500/20 group hover:border-green-500/40 transition-colors">
          <h3 className="text-sm font-medium text-green-400 mb-2 uppercase tracking-wider">Total Orders</h3>
          <p className="text-2xl font-bold text-white">{totalOrders}</p>
        </div>

        <div className="bg-[#13151A] rounded-xl p-5 border border-purple-500/20 group hover:border-purple-500/40 transition-colors">
          <h3 className="text-sm font-medium text-purple-400 mb-2 uppercase tracking-wider">Average Order Value</h3>
          <p className="text-2xl font-bold text-white">{averageOrderValue.toFixed(2)} <span className="text-lg text-gray-500 font-medium">SAR</span></p>
        </div>
      </div>
    </div>
  );
};