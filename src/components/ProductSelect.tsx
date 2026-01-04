import React, { useState, useEffect } from 'react';
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
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const productsData = await getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };


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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white">Products</h2>
        <div className="text-center py-8 text-gray-500">Loading products...</div>
      </div>
    );
  }

  const selectedProducts = orderItems.map(item => item.product);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Products</h2>


      {/* Available Products Grid */}
      <div className="bg-[#1C1F26] rounded-xl border border-gray-800 p-6 space-y-6">
        <h3 className="text-lg font-medium text-white">Available Products</h3>
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
        <div className="space-y-4 bg-[#1C1F26] p-6 rounded-xl border border-gray-800 shadow-xl">
          <h3 className="text-lg font-medium text-white">Selected Products</h3>
          <div className="space-y-3">
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