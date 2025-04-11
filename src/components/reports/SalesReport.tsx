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
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Sales Report</h2>
        </div>
        <p className="text-gray-500">No orders found to generate sales report.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold">Sales Report</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-600 mb-1">Total Sales</h3>
          <p className="text-2xl font-bold">{totalSales.toFixed(2)} SAR</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-600 mb-1">Total Orders</h3>
          <p className="text-2xl font-bold">{totalOrders}</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-purple-600 mb-1">Average Order Value</h3>
          <p className="text-2xl font-bold">{averageOrderValue.toFixed(2)} SAR</p>
        </div>
      </div>
    </div>
  );
};