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
      // Create a new product object to allow price modifications
      const newProduct = { ...product };
      newItems.push({ product: newProduct, quantity: 1 });
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

  const handlePriceChange = (productId: string, newPrice: number) => {
    const newItems = orderItems.map(item => {
      if (item.product.id === productId) {
        return {
          ...item,
          product: {
            ...item.product,
            sellingPrice: newPrice
          }
        };
      }
      return item;
    });
    
    onOrderItemsChange(newItems);
  };

  const handleDeleteProduct = (product: Product) => {
    onOrderItemsChange(orderItems.filter(item => item.product.id !== product.id));
  };

  const products = getProducts();
  const selectedProducts = orderItems.map(item => item.product);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Products</h2>
      
      {/* Available Products Grid */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-medium text-gray-700">Available Products</h3>
        <ProductGrid
          products={products}
          selectedProducts={selectedProducts}
          onProductSelect={handleAddProduct}
          onProductDelete={handleDeleteProduct}
          orderItems={orderItems}
        />
      </div>

      {/* Selected Products */}
      {orderItems.length > 0 && (
        <div className="space-y-3 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-700">Selected Products</h3>
          <div className="space-y-2">
            {orderItems.map((item) => (
              <ProductRow
                key={item.product.id}
                item={item}
                onQuantityChange={(quantity) => handleQuantityChange(item.product.id, quantity)}
                onPriceChange={(price) => handlePriceChange(item.product.id, price)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};