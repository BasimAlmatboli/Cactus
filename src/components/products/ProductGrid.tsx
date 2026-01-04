import React from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { ProductGroupCard } from './ProductGroupCard';
import { getProductCategory } from '../../utils/productCategories';

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
  // Group products by category
  const groupedProducts = products.reduce((acc, product) => {
    const category = getProductCategory(product.name);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  // Separate main categories from "Other Products"
  const mainCategories = ['RGB Light', 'Pixel Screen', 'PC Light', 'TV Light'];
  const otherProducts = groupedProducts['Other Products'] || [];

  // Get quantity for a product
  const getProductQuantity = (productId: string): number => {
    const item = orderItems.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {/* Render Product Groups first */}
      {mainCategories.map((category) => {
        const categoryProducts = groupedProducts[category];
        if (!categoryProducts || categoryProducts.length === 0) return null;

        return (
          <ProductGroupCard
            key={category}
            category={category}
            products={categoryProducts}
            selectedProducts={selectedProducts}
            orderItems={orderItems}
            onProductSelect={onProductSelect}
          />
        );
      })}

      {/* Render Other Products individually */}
      {otherProducts.map((product) => (
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
  );
};