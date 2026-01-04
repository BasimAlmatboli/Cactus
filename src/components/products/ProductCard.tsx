import React from 'react';
import { Check, Info, X, Hash, Lightbulb, MousePointer, Cpu, Monitor, Package } from 'lucide-react';
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

  // Determine theme based on owner
  const isYassir = product.owner === 'yassir';
  const theme = isYassir
    ? {
      bg: 'bg-gradient-to-br from-[#1C1F26] to-blue-900/20',
      bgSelected: 'bg-gradient-to-br from-[#1C1F26] to-blue-900/40',
      border: 'border-blue-500/20',
      borderSelected: 'border-blue-500',
      shadowSelected: 'shadow-blue-500/20',
      shadowHover: 'shadow-blue-500/10',
      iconBg: 'bg-blue-500/10',
      iconText: 'text-blue-400',
      hoverBorder: 'hover:border-blue-500/50',
      badge: 'border-blue-500/20 text-blue-400/80'
    }
    : {
      bg: 'bg-gradient-to-br from-[#1C1F26] to-green-900/20',
      bgSelected: 'bg-gradient-to-br from-[#1C1F26] to-green-900/40',
      border: 'border-green-500/20',
      borderSelected: 'border-green-500',
      shadowSelected: 'shadow-green-500/20',
      shadowHover: 'shadow-green-500/10',
      iconBg: 'bg-green-500/10',
      iconText: 'text-green-400',
      hoverBorder: 'hover:border-green-500/50',
      badge: 'border-green-500/20 text-green-400/80'
    };

  return (
    <div
      className={`relative group h-full flex flex-col items-center text-center p-6 rounded-2xl cursor-pointer transition-all duration-300 ${isSelected
        ? `${theme.bgSelected} border-2 ${theme.borderSelected} shadow-xl ${theme.shadowSelected} scale-[1.02]`
        : `${theme.bg} border ${theme.border} ${theme.hoverBorder} hover:shadow-lg ${theme.shadowHover} hover:-translate-y-1`
        }`}
      onClick={() => onSelect(product)}
    >
      {/* Selection Indicator (Top Right) */}
      {isSelected && (
        <div className="absolute top-3 right-3 z-10">
          <div className={`${isYassir ? 'bg-blue-500 shadow-blue-500/30' : 'bg-green-500 shadow-green-500/30'} text-white p-1.5 rounded-full shadow-lg`}>
            <Check className="h-4 w-4" strokeWidth={3} />
          </div>
        </div>
      )}

      {/* Product Icon (Large & Centered) */}
      <div className={`mb-4 p-4 rounded-2xl transition-colors ${isSelected
        ? `${theme.iconBg} ${theme.iconText}`
        : `bg-[#13151A] text-gray-400 group-hover:${theme.iconText} group-hover:${theme.iconBg}`
        }`}>
        <div className="transform scale-125">
          <Icon />
        </div>
      </div>

      {/* Product Name */}
      <h3 className="text-white font-semibold text-base mb-2 line-clamp-2 h-12 flex items-center justify-center w-full">
        {product.name}
      </h3>

      {/* Price */}
      <div className="mt-auto flex flex-col items-center gap-1 w-full">
        <div className="flex items-baseline gap-2">
          <span className="text-gray-500 text-sm line-through decoration-gray-600">
            {product.cost}
          </span>
          <span className="text-xl font-bold text-white">
            {product.sellingPrice} <span className="text-xs font-normal text-gray-500">SAR</span>
          </span>
        </div>

        {/* Profit Margin Badge */}
        <div className="text-xs font-medium text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full mt-1">
          {profitMargin}% margin
        </div>
      </div>

      {/* Bottom Info: Owner & Quantity */}
      <div className="w-full mt-4 pt-4 border-t border-gray-800/50 flex items-center justify-between text-xs">
        <span className={`px-2 py-0.5 rounded-full border ${theme.badge}`}>
          {product.owner === 'yassir' ? 'Yassir' : 'Basim'}
        </span>

        {quantity > 0 && (
          <span className={`font-bold flex items-center gap-1 px-2 py-0.5 rounded-full ${theme.iconBg} ${theme.iconText}`}>
            <Hash className="h-3 w-3" />
            x{quantity}
          </span>
        )}
      </div>

      {/* Hover Delete Action */}
      {isSelected && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-3 left-3 p-1.5 rounded-full text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
          title="Remove product"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};