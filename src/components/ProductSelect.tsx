import React from 'react';
import { Product, OrderItem } from '../types';
import { getProducts } from '../data/products';
import { ProductRow } from './ProductRow';
import { ProductDropdown } from './ProductDropdown';

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
  const availableProducts = products.filter(
    product => !orderItems.some(item => item.product.id === product.id)
  );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Products</h2>
      
      {availableProducts.length > 0 && (
        <ProductDropdown 
          products={availableProducts}
          onSelect={handleAddProduct}
        />
      )}
      
      <div className="space-y-3">
        {orderItems.map((item) => (
          <ProductRow
            key={item.product.id}
            item={item}
            onQuantityChange={(quantity) => handleQuantityChange(item.product.id, quantity)}
          />
        ))}
      </div>
    </div>
  );
};