import React from 'react';
import { Product } from '../../types';
import { Trash2 } from 'lucide-react';

interface ProductListProps {
  products: Product[];
  onProductChange: (id: string, field: keyof Product, value: number | string) => void;
  onDeleteProduct: (id: string) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  onProductChange,
  onDeleteProduct,
}) => {
  const calculateProfitMargin = (cost: number, sellingPrice: number) => {
    return ((sellingPrice - cost) / cost * 100).toFixed(1);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Product Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cost (SAR)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Selling Price (SAR)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Owner
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Profit Margin
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) => onProductChange(product.id, 'name', e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="number"
                  value={product.cost}
                  onChange={(e) => onProductChange(product.id, 'cost', Number(e.target.value))}
                  className="w-32 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  step="0.01"
                  min="0"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="number"
                  value={product.sellingPrice}
                  onChange={(e) => onProductChange(product.id, 'sellingPrice', Number(e.target.value))}
                  className="w-32 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  step="0.01"
                  min="0"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <select
                  value={product.owner}
                  onChange={(e) => onProductChange(product.id, 'owner', e.target.value)}
                  className="w-32 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="basim">Basim</option>
                  <option value="yassir">Yassir</option>
                </select>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {calculateProfitMargin(product.cost, product.sellingPrice)}%
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => onDeleteProduct(product.id)}
                  className="text-red-600 hover:text-red-900 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};