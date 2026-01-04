import React from 'react';
import { Product } from '../../types';
import { getCategoryIcon, getCategoryDescription } from '../../utils/productCategories';
import { ChevronDown, Check } from 'lucide-react';

interface ProductGroupCardProps {
  category: string;
  products: Product[];
  selectedProducts: Product[];
  orderItems: { product: Product; quantity: number }[];
  onProductSelect: (product: Product) => void;
}

export const ProductGroupCard: React.FC<ProductGroupCardProps> = ({
  category,
  products,
  selectedProducts,
  orderItems,
  onProductSelect,
}) => {
  const IconComponent = getCategoryIcon(category);
  const description = getCategoryDescription(category);

  // Count how many products from this group are selected
  const selectedCount = products.filter(product =>
    selectedProducts.some(selected => selected.id === product.id)
  ).length;

  // Calculate total quantity for this group
  const totalQuantity = products.reduce((sum, product) => {
    const item = orderItems.find(item => item.product.id === product.id);
    return sum + (item ? item.quantity : 0);
  }, 0);

  // Calculate price range
  const prices = products.map(p => p.sellingPrice);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = minPrice === maxPrice ? `${minPrice} SAR` : `${minPrice} - ${maxPrice} SAR`;

  const hasSelections = selectedCount > 0;

  const handleProductSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = event.target.value;
    if (productId) {
      const selectedProduct = products.find(p => p.id === productId);
      if (selectedProduct) {
        onProductSelect(selectedProduct);
      }
      // Reset the dropdown to default option
      event.target.value = '';
    }
  };

  // Determine group theme
  const owners = Array.from(new Set(products.map(p => p.owner)));
  const isMixed = owners.length > 1;
  const isYassir = !isMixed && owners[0] === 'yassir';

  const theme = isMixed
    ? {
      bg: 'bg-gradient-to-br from-[#1C1F26] to-purple-900/20',
      bgSelected: 'bg-gradient-to-br from-[#1C1F26] to-purple-900/40',
      border: 'border-purple-500/20',
      borderSelected: 'border-purple-500',
      shadowSelected: 'shadow-purple-500/20',
      shadowHover: 'shadow-purple-500/10',
      iconBg: 'bg-purple-500/10',
      iconText: 'text-purple-400',
      hoverBorder: 'hover:border-purple-500/50',
      focusRing: 'focus:ring-purple-500/50',
      focusBorder: 'focus:border-purple-500',
      badgeBg: 'bg-purple-500',
      badgeShadow: 'shadow-purple-500/20',
      arrowText: 'text-purple-400',
      selectedText: 'text-purple-400'
    }
    : isYassir
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
        focusRing: 'focus:ring-blue-500/50',
        focusBorder: 'focus:border-blue-500',
        badgeBg: 'bg-blue-500',
        badgeShadow: 'shadow-blue-500/20',
        arrowText: 'text-blue-400',
        selectedText: 'text-blue-400'
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
        focusRing: 'focus:ring-green-500/50',
        focusBorder: 'focus:border-green-500',
        badgeBg: 'bg-green-500',
        badgeShadow: 'shadow-green-500/20',
        arrowText: 'text-green-400',
        selectedText: 'text-green-400'
      };

  return (
    <div
      className={`relative h-full flex flex-col items-center text-center p-6 rounded-2xl border-2 transition-all duration-300 ${hasSelections
        ? `${theme.bgSelected} ${theme.borderSelected} shadow-xl ${theme.shadowSelected}`
        : `${theme.bg} ${theme.border} hover:border-gray-600 ${theme.hoverBorder} hover:bg-[#232730]`
        }`}
    >
      {/* Selection Counter Badge (Top Right) */}
      {hasSelections && (
        <div className="absolute top-3 right-3">
          <div className={`${theme.badgeBg} text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg ${theme.badgeShadow} flex items-center gap-1`}>
            <Check className="h-3 w-3" />
            {selectedCount}
          </div>
        </div>
      )}

      {/* Header Section (Centered) */}
      <div className="flex flex-col items-center w-full mb-4">
        <div className={`mb-4 p-4 rounded-2xl transition-colors ${hasSelections
          ? `${theme.iconBg} ${theme.iconText}`
          : 'bg-[#13151A] text-gray-400'
          }`}>
          <IconComponent className="h-6 w-6 transform scale-125" />
        </div>

        <h3 className="text-white font-semibold text-base mb-1">{category}</h3>
        <p className="text-sm text-gray-500 line-clamp-1">{description}</p>

        {/* Price Range */}
        <div className="mt-3 text-sm font-medium text-white bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700/50">
          {priceRange}
        </div>
      </div>

      {/* Footer / Interaction Area */}
      <div className="mt-auto w-full space-y-3">
        {/* Dropdown */}
        <div className="relative group/select">
          <select
            onChange={handleProductSelect}
            className={`w-full p-3 bg-[#13151A] border border-gray-700 rounded-xl text-sm text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 ${theme.focusRing} ${theme.focusBorder} hover:border-gray-600 transition-all pl-4 pr-10`}
            defaultValue=""
          >
            <option value="" disabled className="text-gray-500">
              Select Variation
            </option>
            {products.map((product) => {
              const isSelected = selectedProducts.some(p => p.id === product.id);
              const quantity = orderItems.find(item => item.product.id === product.id)?.quantity || 0;
              const displayText = `${product.name} (${product.sellingPrice} SAR)${quantity > 0 ? ` x${quantity}` : ''}`;

              // Determine product-specific color for dropdown option?
              // HTML options don't support complex styling well, keeping simple dark theme
              return (
                <option key={product.id} value={product.id} className="bg-[#1C1F26] text-white py-2">
                  {isSelected ? '✓ ' : ''}{displayText}
                </option>
              );
            })}
          </select>
          <div className={`absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400 group-hover/select:text-white transition-colors`}>
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>

        {/* Total Quantity Indicator */}
        {totalQuantity > 0 && (
          <div className={`flex items-center justify-center gap-2 text-xs font-medium ${theme.selectedText} pt-2 border-t border-gray-800/50`}>
            <span>Total Qty:</span>
            <span className={`${theme.iconBg} px-2 py-0.5 rounded-full`}>{totalQuantity}</span>
          </div>
        )}
      </div>
    </div>
  );
};