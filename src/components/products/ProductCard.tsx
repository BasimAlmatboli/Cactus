import React from 'react';
import { Plus, Check } from 'lucide-react';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isSelected,
  onSelect,
}) => {
  const profitMargin = ((product.sellingPrice - product.cost) / product.cost * 100).toFixed(1);

  return (
    <div
      className={`relative p-4 rounded-lg cursor-pointer transition-all ${
        isSelected 
          ? 'bg-blue-50 border-2 border-blue-500 shadow-md' 
          : 'bg-white border-2 border-transparent hover:border-blue-200 shadow-sm'
      }`}
      onClick={() => onSelect(product)}
    >
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-gray-900">{product.name}</h3>
          <button
            className={`p-1.5 rounded-full ${
              isSelected 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-500 hover:bg-blue-100'
            }`}
          >
            {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </button>
        </div>
        
        <div className="space-y-1">
          <div className="text-sm text-gray-600">
            Cost: <span className="font-medium text-gray-900">{product.cost} SAR</span>
          </div>
          <div className="text-sm text-gray-600">
            Price: <span className="font-medium text-gray-900">{product.sellingPrice} SAR</span>
          </div>
          <div className="text-sm text-gray-600">
            Margin: <span className="font-medium text-green-600">{profitMargin}%</span>
          </div>
        </div>

        <div className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 w-fit">
          {product.owner === 'yassir' ? 'Yassir' : 'Basim'}
        </div>
      </div>
    </div>
  );
};