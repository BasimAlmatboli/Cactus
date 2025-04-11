import React from 'react';
import { Order } from '../../types';
import { Package } from 'lucide-react';

interface ProductPerformance {
  productId: string;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
  totalProfit: number;
}

interface ProductPerformanceProps {
  orders: Order[];
}

export const ProductPerformance: React.FC<ProductPerformanceProps> = ({ orders }) => {
  const productPerformance = orders.reduce<Record<string, ProductPerformance>>((acc, order) => {
    order.items.forEach(item => {
      const { product, quantity } = item;
      const revenue = product.sellingPrice * quantity;
      const cost = product.cost * quantity;
      const profit = revenue - cost;

      if (!acc[product.id]) {
        acc[product.id] = {
          productId: product.id,
          name: product.name,
          totalQuantity: 0,
          totalRevenue: 0,
          totalProfit: 0,
        };
      }

      acc[product.id].totalQuantity += quantity;
      acc[product.id].totalRevenue += revenue;
      acc[product.id].totalProfit += profit;
    });

    return acc;
  }, {});

  const sortedProducts = Object.values(productPerformance).sort(
    (a, b) => b.totalRevenue - a.totalRevenue
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Package className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold">Product Performance</h2>
      </div>

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
                Revenue
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Profit
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedProducts.map((product) => (
              <tr key={product.productId}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {product.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.totalQuantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.totalRevenue.toFixed(2)} SAR
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.totalProfit.toFixed(2)} SAR
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};