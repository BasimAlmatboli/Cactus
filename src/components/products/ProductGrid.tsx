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
    <div className="space-y-6">
      {/* Main Product Groups */}
      {mainCategories.some(category => groupedProducts[category]?.length > 0) && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
            Product Categories
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        </div>
      )}

      {/* Other Products (individual cards) */}
      {otherProducts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
            Other Products
          </h3>
          
          {/* Group other products by owner */}
          {(() => {
            const otherGroupedByOwner = otherProducts.reduce((acc, product) => {
              const group = product.owner === 'yassir' ? 'Yassir\'s Products' : 'Basim\'s Products';
              if (!acc[group]) {
                acc[group] = [];
              }
              acc[group].push(product);
              return acc;
            }, {} as Record<string, Product[]>);

            return Object.entries(otherGroupedByOwner).map(([group, groupProducts]) => (
              <div key={group} className="space-y-3">
                <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                  {group}
                </h4>
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
            ));
          })()}
        </div>
      )}
    </div>
  );
};