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
      <div className="bg-[#1C1F26] rounded-xl border border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <ShoppingBag className="h-6 w-6 text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Product Sales</h2>
        </div>
        <p className="text-gray-500">No orders found.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1C1F26] rounded-xl border border-gray-800 p-6">
      <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <ShoppingBag className="h-6 w-6 text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">Product Sales</h2>
      </div>

      {/* Total Products Sold */}
      <div className="bg-[#13151A] rounded-xl p-6 mb-8 border border-gray-800">
        <h3 className="text-sm font-medium text-blue-400 mb-2 uppercase tracking-wider">Total Products Sold</h3>
        <p className="text-3xl font-bold text-white">{totalProductsSold} <span className="text-lg text-gray-500 font-medium">units</span></p>
      </div>

      {/* Individual Product Sales */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-[#13151A]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider rounded-tl-lg">
                Product
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Units Sold
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Total Revenue
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider rounded-tr-lg">
                % of Total Sales
              </th>
            </tr>
          </thead>
          <tbody className="bg-[#1C1F26] divide-y divide-gray-800">
            {sortedProducts.map((product) => (
              <tr key={product.id} className="hover:bg-[#232730] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="p-2 bg-[#13151A] rounded-lg mr-3 border border-gray-800">
                      <Package className="h-4 w-4 text-gray-400" />
                    </div>
                    <span className="text-sm font-medium text-white">
                      {product.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {product.count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                  {product.revenue.toFixed(2)} SAR
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full text-xs font-medium border border-blue-500/20">
                    {((product.count / totalProductsSold) * 100).toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};