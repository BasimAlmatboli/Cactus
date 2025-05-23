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
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
      <div className="flex-1">
        <h3 className="font-medium">{item.product.name}</h3>
        <p className="text-sm text-gray-600">
          Cost: {item.product.cost} SAR
        </p>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Price (SAR)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={item.product.sellingPrice}
              onChange={(e) => onPriceChange(parseFloat(e.target.value) || 0)}
              className="w-24 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Quantity</label>
            <input
              type="number"
              min={0}
              value={item.quantity}
              onChange={(e) => onQuantityChange(parseInt(e.target.value) || 0)}
              className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <button
          onClick={() => onQuantityChange(0)}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          aria-label="Remove product"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};