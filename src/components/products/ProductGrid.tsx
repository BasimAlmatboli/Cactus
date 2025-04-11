import React from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  selectedProducts: Product[];
  onProductSelect: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  selectedProducts,
  onProductSelect,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isSelected={selectedProducts.some(p => p.id === product.id)}
          onSelect={onProductSelect}
        />
      ))}
    </div>
  );
};