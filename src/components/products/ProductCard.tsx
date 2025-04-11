import React from 'react';
import { Plus, Check, Package, Lightbulb, MousePointer, Cpu, Monitor, X } from 'lucide-react';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  quantity?: number;
  onSelect: (product: Product) => void;
  onDelete?: () => void;
}

const getProductIcon = (productName: string) => {
  switch (productName) {
    case 'Lines RGB Light':
      return <Lightbulb className="h-4 w-4" />;
    case 'Mousepad':
      return <MousePointer className="h-4 w-4" />;
    case 'Smart Cube':
      return <Cpu className="h-4 w-4" />;
    case 'pixel screen 16':
    case 'pixel screen 32':
      return <Monitor className="h-4 w-4" />;
    default:
      return <Package className="h-4 w-4" />;
  }
};

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isSelected,
  quantity = 0,
  onSelect,
  onDelete,
}) => {
  const profitMargin = ((product.sellingPrice - product.cost) / product.cost * 100).toFixed(1);
  const Icon = () => getProductIcon(product.name);

  return (
    <div
      className={`relative p-3 rounded-lg cursor-pointer transition-all ${
        isSelected 
          ? 'bg-blue-50 border border-blue-500 shadow-sm' 
          : 'bg-white border border-gray-200 hover:border-blue-200 hover:shadow-sm'
      }`}
      onClick={() => onSelect(product)}
    >
      <div className="space-y-2">
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`p-1.5 rounded-md ${
              isSelected ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <Icon />
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-900 truncate">{product.name}</h3>
              {quantity > 0 && (
                <span className="text-xs text-blue-600">
                  Quantity: {quantity}
                </span>
              )}
            </div>
          </div>
          {isSelected && onDelete ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
              title="Remove product"
            >
              <X className="h-3 w-3" />
            </button>
          ) : (
            <button
              className={`p-1.5 rounded-full flex-shrink-0 transition-colors ${
                isSelected 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-blue-500'
              }`}
            >
              {isSelected ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
            </button>
          )}
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="space-x-2">
            <span className="text-gray-500">{product.cost} SAR</span>
            <span className="text-gray-400">→</span>
            <span className="font-medium text-gray-900">{product.sellingPrice} SAR</span>
          </div>
          <div className="text-xs font-medium text-green-600">
            {profitMargin}%
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            {product.owner === 'yassir' ? 'Yassir' : 'Basim'}
          </div>
        </div>

        {isSelected && (
          <div className="absolute -top-1.5 -right-1.5 bg-blue-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-full">
            Selected
          </div>
        )}
      </div>
    </div>
  );
};