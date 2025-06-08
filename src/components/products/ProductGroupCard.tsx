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

  return (
    <div
      className={`relative p-4 rounded-lg border-2 transition-all ${
        hasSelections 
          ? 'bg-blue-50 border-blue-200 shadow-md' 
          : 'bg-white border-gray-200 hover:border-blue-200 hover:shadow-sm'
      }`}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              hasSelections ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <IconComponent className={`h-6 w-6 ${
                hasSelections ? 'text-blue-600' : 'text-gray-600'
              }`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{category}</h3>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          </div>
          
          {hasSelections && (
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-full">
              <Check className="h-3 w-3 text-blue-600" />
              <span className="text-xs font-medium text-blue-600">
                {selectedCount}
              </span>
            </div>
          )}
        </div>

        {/* Product Dropdown */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Select Variation
          </label>
          <div className="relative">
            <select
              onChange={handleProductSelect}
              className="w-full p-3 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
              defaultValue=""
            >
              <option value="" disabled>
                Choose a variation...
              </option>
              {products.map((product) => {
                const isSelected = selectedProducts.some(p => p.id === product.id);
                const quantity = orderItems.find(item => item.product.id === product.id)?.quantity || 0;
                const displayText = `${product.name} - ${product.sellingPrice} SAR${
                  isSelected ? ` (Selected${quantity > 0 ? ` x${quantity}` : ''})` : ''
                }`;
                
                return (
                  <option key={product.id} value={product.id}>
                    {displayText}
                  </option>
                );
              })}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="flex items-center justify-between text-sm">
          <div className="space-y-1">
            <div className="text-gray-600">
              {products.length} variation{products.length !== 1 ? 's' : ''}
            </div>
            {totalQuantity > 0 && (
              <div className="text-blue-600 font-medium">
                Total qty: {totalQuantity}
              </div>
            )}
          </div>
          
          <div className="text-right">
            <div className="font-medium text-gray-900">{priceRange}</div>
            <div className="text-xs text-gray-500">Price range</div>
          </div>
        </div>

        {/* Selection indicator */}
        {hasSelections && (
          <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {selectedCount} selected
          </div>
        )}
      </div>
    </div>
  );
};