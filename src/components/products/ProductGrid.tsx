import React from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  selectedProducts: Product[];
  onProductSelect: (product: Product) => void;
  onProductDelete?: (product: Product) => void;
  orderItems: { product: Product; quantity: number }[];
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  selectedProducts,
  onProductSelect,
  onProductDelete,
  orderItems,
}) => {
  // Group products by owner
  const groupedProducts = products.reduce((acc, product) => {
    const group = product.owner === 'yassir' ? 'Yassir\'s Products' : 'Basim\'s Products';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  // Get quantity for a product
  const getProductQuantity = (productId: string): number => {
    const item = orderItems.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="space-y-4">
      {Object.entries(groupedProducts).map(([group, groupProducts]) => (
        <div key={group} className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
            {group}
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {groupProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isSelected={selectedProducts.some(p => p.id === product.id)}
                quantity={getProductQuantity(product.id)}
                onSelect={onProductSelect}
                onDelete={
                  selectedProducts.some(p => p.id === product.id) && onProductDelete
                    ? () => onProductDelete(product)
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};