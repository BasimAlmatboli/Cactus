import React, { useState, useEffect } from 'react';
import { Product, OrderItem, Offer, AppliedOffer } from '../types';
import { getProducts } from '../data/products';
import { ProductRow } from './ProductRow';
import { ProductGrid } from './products/ProductGrid';
import { getActiveOffers } from '../services/offerService';
import { findApplicableOffers, getBestOffer, applyOfferToItems } from '../utils/offerHelpers';
import { Tag } from 'lucide-react';

interface ProductSelectProps {
  orderItems: OrderItem[];
  onOrderItemsChange: (items: OrderItem[]) => void;
  onOfferApplied?: (offer: AppliedOffer | null) => void;
}

export const ProductSelect: React.FC<ProductSelectProps> = ({
  orderItems,
  onOrderItemsChange,
  onOfferApplied,
}) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [currentAppliedOffer, setCurrentAppliedOffer] = useState<AppliedOffer | null>(null);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      const activeOffers = await getActiveOffers();
      setOffers(activeOffers);
    } catch (error) {
      console.error('Failed to load offers:', error);
    }
  };

  // Check and apply offers whenever order items change
  useEffect(() => {
    if (offers.length === 0) {
      if (currentAppliedOffer) {
        setCurrentAppliedOffer(null);
        onOfferApplied?.(null);
      }
      return;
    }

    const applicableOffers = findApplicableOffers(orderItems, offers);

    if (applicableOffers.length === 0) {
      if (currentAppliedOffer) {
        setCurrentAppliedOffer(null);
        onOfferApplied?.(null);
      }
      return;
    }

    const bestOffer = getBestOffer(orderItems, applicableOffers);

    if (bestOffer) {
      const { appliedOffer } = applyOfferToItems(orderItems, bestOffer);

      // Only update if the offer has changed
      if (!currentAppliedOffer || currentAppliedOffer.offerId !== appliedOffer?.offerId) {
        setCurrentAppliedOffer(appliedOffer);
        onOfferApplied?.(appliedOffer);
      }
    } else {
      if (currentAppliedOffer) {
        setCurrentAppliedOffer(null);
        onOfferApplied?.(null);
      }
    }
  }, [orderItems.map(item => item.product.id).join(','), offers.length]);
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

      {/* Applied Offer Banner */}
      {currentAppliedOffer && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Tag className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-green-900">
                Offer Applied: {currentAppliedOffer.offerName}
              </h4>
              <p className="text-sm text-green-700 mt-1">
                {currentAppliedOffer.discountType === 'percentage'
                  ? `${currentAppliedOffer.discountValue}% discount`
                  : `${currentAppliedOffer.discountValue} SAR discount`
                } applied to target product
              </p>
              <p className="text-xs text-green-600 mt-1">
                Discount Amount: {currentAppliedOffer.discountAmount.toFixed(2)} SAR
              </p>
            </div>
          </div>
        </div>
      )}

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