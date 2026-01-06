import React from 'react';
import { Product } from '../../types';
import { Trash2, Hash } from 'lucide-react';

interface ProductListProps {
  products: Product[];
  onProductChange: (id: string, field: keyof Product, value: number | string) => void;
  onDeleteProduct: (id: string) => void;
  isSaving?: boolean;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  onProductChange,
  onDeleteProduct,
  isSaving = false,
}) => {
  const calculateProfitMargin = (cost: number, sellingPrice: number) => {
    return ((sellingPrice - cost) / cost * 100).toFixed(1);
  };

  const validateSKU = (sku: string, currentProductId: string) => {
    const duplicateExists = products.some(p => p.id !== currentProductId && p.sku === sku);
    return !duplicateExists;
  };

  const handleSKUChange = (productId: string, newSKU: string) => {
    const upperSKU = newSKU.toUpperCase();
    if (validateSKU(upperSKU, productId)) {
      onProductChange(productId, 'sku', upperSKU);
    } else {
      alert('SKU already exists. Please use a different SKU.');
    }
  };

  return (
    <div className="bg-gray-900/50 rounded-lg shadow overflow-hidden border border-gray-700">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700 text-sm"> {/* Added text-sm to reduce font size globally */}
          <thead className="bg-gray-800">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/4"> {/* Slightly wider for Name */}
                Product Name
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Cost <span className="hidden sm:inline">(SAR)</span>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Selling <span className="hidden sm:inline">(SAR)</span>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Owner
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                <span className="hidden sm:inline">Margin</span> {/* Shortened text */}
                <span className="sm:hidden">%</span>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-10">

              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-900/50 divide-y divide-gray-700">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-3 py-2 whitespace-nowrap">
                  <input
                    type="text"
                    value={product.name}
                    onChange={(e) => onProductChange(product.id, 'name', e.target.value)}
                    className="w-full border-gray-600 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-3 py-1.5 border bg-gray-700 text-white text-sm"
                    disabled={isSaving}
                  />
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="flex items-center space-x-1">
                    <Hash className="h-3 w-3 text-gray-500" />
                    <input
                      type="text"
                      value={product.sku}
                      onChange={(e) => handleSKUChange(product.id, e.target.value)}
                      className="w-24 border-gray-600 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-xs px-2 py-1.5 border bg-gray-700 text-white"
                      placeholder="SKU"
                      disabled={isSaving}
                    />
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <input
                    type="number"
                    value={product.cost}
                    onChange={(e) => onProductChange(product.id, 'cost', Number(e.target.value))}
                    className="w-20 border-gray-600 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-2 py-1.5 border bg-gray-700 text-white text-sm text-right"
                    step="0.01"
                    min="0"
                    disabled={isSaving}
                  />
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <input
                    type="number"
                    value={product.sellingPrice}
                    onChange={(e) => onProductChange(product.id, 'sellingPrice', Number(e.target.value))}
                    className="w-20 border-gray-600 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-2 py-1.5 border bg-gray-700 text-white text-sm text-right"
                    step="0.01"
                    min="0"
                    disabled={isSaving}
                  />
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <select
                    value={product.owner}
                    onChange={(e) => onProductChange(product.id, 'owner', e.target.value)}
                    className="w-24 border-gray-600 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-2 py-1.5 border bg-gray-700 text-white text-sm"
                    disabled={isSaving}
                  >
                    <option value="basim">Basim</option>
                    <option value="yassir">Yassir</option>
                  </select>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-400">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium 
                    ${Number(calculateProfitMargin(product.cost, product.sellingPrice)) < 20 ? 'bg-red-900/40 text-red-300' : 'bg-green-900/40 text-green-300'}
                  `}>
                    {calculateProfitMargin(product.cost, product.sellingPrice)}%
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-right">
                  <button
                    onClick={() => onDeleteProduct(product.id)}
                    className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed p-1 hover:bg-red-900/20 rounded"
                    title="Delete Product"
                    disabled={isSaving}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};