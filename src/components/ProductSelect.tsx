import React from 'react';
import { Product, OrderItem } from '../types';
import { getProducts } from '../data/products';
import { ProductRow } from './ProductRow';
import { ProductGrid } from './products/ProductGrid';

interface ProductSelectProps {
  orderItems: OrderItem[];
  onOrderItemsChange: (items: OrderItem[]) => void;
}

export const ProductSelect: React.FC<ProductSelectProps> = ({
  orderItems,
  onOrderItemsChange,
}) => {
  const handleAddProduct = (product: Product) => {
    const newItems = [...orderItems];
    const existingItem = newItems.find(item => item.product.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      newItems.push({ product, quantity: 1 });
    }
    
    onOrderItemsChange(newItems);
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity === 0) {
      onOrderItemsChange(orderItems.filter(item => item.product.id !== productId));
      return;
    }

    const newItems = orderItems.map(item => 
      item.product.id === productId ? { ...item, quantity } : item
    );
    
    onOrderItemsChange(newItems);
  };

  const products = getProducts();
  const selectedProducts = orderItems.map(item => item.product);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Products</h2>
      
      {/* Available Products Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">Available Products</h3>
        <ProductGrid
          products={products}
          selectedProducts={selectedProducts}
          onProductSelect={handleAddProduct}
        />
      </div>

      {/* Selected Products */}
      {orderItems.length > 0 && (
        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700">Selected Products</h3>
          <div className="space-y-2">
            {orderItems.map((item) => (
              <ProductRow
                key={item.product.id}
                item={item}
                onQuantityChange={(quantity) => handleQuantityChange(item.product.id, quantity)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};