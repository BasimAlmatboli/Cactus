import React from 'react';
import { Trash2 } from 'lucide-react';
import { OrderItem } from '../types';

interface ProductRowProps {
  item: OrderItem;
  onQuantityChange: (quantity: number) => void;
  onPriceChange: (price: number) => void;
}

export const ProductRow: React.FC<ProductRowProps> = ({
  item,
  onQuantityChange,
  onPriceChange,
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-[#13151A] rounded-xl border border-gray-800 transition-all hover:border-gray-700">
      <div className="flex-1">
        <h3 className="font-medium text-white">{item.product.name}</h3>
        <p className="text-sm text-gray-500">
          Cost: {item.product.cost} SAR
        </p>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-4">
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1.5 font-medium">Price (SAR)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={item.product.sellingPrice}
              onChange={(e) => onPriceChange(parseFloat(e.target.value) || 0)}
              className="w-24 px-3 py-1.5 bg-[#1C1F26] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1.5 font-medium">Quantity</label>
            <input
              type="number"
              min={0}
              value={item.quantity}
              onChange={(e) => onQuantityChange(parseInt(e.target.value) || 0)}
              className="w-20 px-3 py-1.5 bg-[#1C1F26] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
            />
          </div>
        </div>

        <button
          onClick={() => onQuantityChange(0)}
          className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
          aria-label="Remove product"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};