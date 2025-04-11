import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Product } from '../types';

interface ProductDropdownProps {
  products: Product[];
  onSelect: (product: Product) => void;
}

export const ProductDropdown: React.FC<ProductDropdownProps> = ({
  products,
  onSelect,
}) => {
  return (
    <div className="relative">
      <select
        onChange={(e) => {
          const product = products.find(p => p.id === e.target.value);
          if (product) {
            onSelect(product);
            e.target.value = ''; // Reset selection
          }
        }}
        className="w-full p-3 bg-white rounded-lg shadow appearance-none cursor-pointer pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
        defaultValue=""
      >
        <option value="" disabled>Add a product...</option>
        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.name} - {product.sellingPrice} SAR
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <ChevronDown className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  );
};