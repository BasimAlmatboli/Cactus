import React from 'react';
import { Order } from '../../types';
import { Package, ShoppingBag } from 'lucide-react';

interface ProductSale {
  id: string;
  name: string;
  count: number;
  revenue: number;
}

interface ProductSalesReportProps {
  orders: Order[];
}

export const ProductSalesReport: React.FC<ProductSalesReportProps> = ({ orders }) => {
  // Calculate product sales
  const productSales = orders.reduce<Record<string, ProductSale>>((acc, order) => {
    order.items.forEach(item => {
      const { product, quantity } = item;
      if (!acc[product.id]) {
        acc[product.id] = {
          id: product.id,
          name: product.name,
          count: 0,
          revenue: 0
        };
      }
      acc[product.id].count += quantity;
      acc[product.id].revenue += product.sellingPrice * quantity;
    });
    return acc;
  }, {});

  const totalProductsSold = Object.values(productSales).reduce(
    (sum, product) => sum + product.count,
    0
  );

  // Sort products by count in descending order
  const sortedProducts = Object.values(productSales).sort(
    (a, b) => b.count - a.count
  );

  if (!orders?.length) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-6">
          <ShoppingBag className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Product Sales Report</h2>
        </div>
        <p className="text-gray-500">No orders found to generate product sales report.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <ShoppingBag className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold">Product Sales Report</h2>
      </div>

      {/* Total Products Sold */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-blue-600 mb-1">Total Products Sold</h3>
        <p className="text-2xl font-bold text-blue-700">{totalProductsSold} units</p>
      </div>

      {/* Individual Product Sales */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Units Sold
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Revenue
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                % of Total Sales
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedProducts.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {product.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.revenue.toFixed(2)} SAR
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {((product.count / totalProductsSold) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};