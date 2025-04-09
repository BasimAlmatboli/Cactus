import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ProductSelect } from '../components/ProductSelect';
import { ShippingSelect } from '../components/ShippingSelect';
import { PaymentSelect } from '../components/PaymentSelect';
import { OrderSummary } from '../components/OrderSummary';
import { DiscountInput } from '../components/DiscountInput';
import { saveOrder, getOrderById } from '../services/orderService';
import { useOrder } from '../hooks/useOrder';
import { Loader2, User, Save } from 'lucide-react';

export const Calculator = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editOrderId = searchParams.get('edit');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!editOrderId);
  const [loadError, setLoadError] = useState<string | null>(null);

  const {
    orderNumber,
    setOrderNumber,
    customerName,
    setCustomerName,
    orderItems,
    setOrderItems,
    shippingMethod,
    setShippingMethod,
    paymentMethod,
    setPaymentMethod,
    isFreeShipping,
    setIsFreeShipping,
    discount,
    setDiscount,
    order,
    setInitialOrder,
  } = useOrder();

  // Load existing order if editing
  useEffect(() => {
    const loadOrder = async () => {
      if (editOrderId) {
        try {
          setIsLoading(true);
          setLoadError(null);
          const existingOrder = await getOrderById(editOrderId);
          
          if (existingOrder) {
            setInitialOrder(existingOrder);
          } else {
            setLoadError('Order not found');
          }
        } catch (error) {
          console.error('Error loading order:', error);
          setLoadError('Failed to load order details. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadOrder();
  }, [editOrderId]);

  const handleSaveOrder = async () => {
    if (!order) {
      alert('Please complete all required fields');
      return;
    }
    
    if (!orderNumber.trim()) {
      alert('Please enter an order number');
      return;
    }

    if (orderItems.length === 0) {
      alert('Please add at least one product');
      return;
    }

    if (!shippingMethod) {
      alert('Please select a shipping method');
      return;
    }

    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    try {
      setIsSaving(true);
      await saveOrder(order);
      navigate('/orders', { replace: true });
    } catch (error) {
      console.error('Error saving order:', error);
      alert('There was an error saving the order. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span>Loading order details...</span>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {loadError}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 pb-24">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-8">
          {editOrderId ? 'Edit Order' : 'Order Profit Calculator'}
        </h1>

        <div className="space-y-8">
          {/* Order Details Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Order Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Order Number *
                </label>
                <input
                  id="orderNumber"
                  type="text"
                  placeholder="Enter Order Number"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Customer Name (Optional)
                  </span>
                </label>
                <input
                  id="customerName"
                  type="text"
                  placeholder="Enter Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
          
          {/* Shipping Section */}
          <ShippingSelect
            selected={shippingMethod}
            onSelect={setShippingMethod}
            isFreeShipping={isFreeShipping}
            onFreeShippingChange={setIsFreeShipping}
          />
          
          {/* Payment Section */}
          <PaymentSelect
            selected={paymentMethod}
            onSelect={setPaymentMethod}
          />
          
          {/* Products Section */}
          <ProductSelect
            orderItems={orderItems}
            onOrderItemsChange={setOrderItems}
          />
          
          {/* Discount Section */}
          <DiscountInput onApplyDiscount={setDiscount} />
          
          {/* Order Summary */}
          {order && <OrderSummary order={order} />}
        </div>
      </div>

      {/* Floating Save Button */}
      {order && (
        <div className="fixed bottom-0 left-0 right-0 bg-white bg-opacity-90 backdrop-blur-sm border-t border-gray-200 p-4 shadow-lg z-50">
          <div className="max-w-3xl mx-auto px-4">
            <button
              onClick={handleSaveOrder}
              disabled={isSaving}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg transition-colors font-medium ${
                isSaving 
                  ? 'opacity-75 cursor-not-allowed' 
                  : 'hover:bg-green-700'
              }`}
            >
              <Save className="h-5 w-5" />
              <span>
                {isSaving 
                  ? 'Saving...' 
                  : editOrderId 
                    ? 'Update Order' 
                    : 'Save Order'
                }
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};