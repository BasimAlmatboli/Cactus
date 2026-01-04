import { useState, useEffect } from 'react';
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
    setDiscount,
    setAppliedOffer,
    order,
    setInitialOrder,
    updateShippingCost,
    resetOrder,
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

      if (editOrderId) {
        navigate('/orders', { replace: true });
      } else {
        resetOrder();
        navigate('/calculator', { replace: true });
      }
    } catch (error) {
      console.error('Error saving order:', error);
      alert('There was an error saving the order. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShippingCostChange = (cost: number) => {
    if (shippingMethod) {
      updateShippingCost(cost);
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

  // Calculate total paid by customer
  const totalPaidByCustomer = order ? (order.subtotal + (order.isFreeShipping ? 0 : order.shippingCost) - (order.discount ? (order.discount.type === 'percentage' ? (order.subtotal * order.discount.value / 100) : order.discount.value) : 0)) : 0;

  return (
    <div className="pt-2 pb-32">
      <div className="max-w-[1600px] px-6">
        <h1 className="text-3xl font-bold text-white mb-6">
          {editOrderId ? 'Edit Order' : 'Order Profit Calculator'}
        </h1>

        <div className="space-y-6">
          {/* Order Details Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Order Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-400 mb-2">
                  Order Number *
                </label>
                <input
                  id="orderNumber"
                  type="text"
                  placeholder="Enter Order Number"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full p-3 bg-[#1C1F26] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-400 mb-2">
                  <span className="flex items-center gap-2">
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
                  className="w-full p-3 bg-[#1C1F26] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shipping Section */}
            <div className="h-full">
              <ShippingSelect
                selected={shippingMethod}
                onSelect={setShippingMethod}
                isFreeShipping={isFreeShipping}
                onFreeShippingChange={setIsFreeShipping}
                onShippingCostChange={handleShippingCostChange}
              />
            </div>

            {/* Payment Section */}
            <div className="h-full">
              <PaymentSelect
                selected={paymentMethod}
                onSelect={setPaymentMethod}
              />
            </div>
          </div>

          {/* Products Section */}
          <ProductSelect
            orderItems={orderItems}
            onOrderItemsChange={setOrderItems}
            onOfferApplied={setAppliedOffer}
          />

          {/* Discount Section */}
          <DiscountInput onApplyDiscount={setDiscount} />

          {/* Order Summary */}
          {order && <OrderSummary order={order} />}
        </div>
      </div>

      {/* Floating Save Button */}
      {order && (
        <div className="fixed bottom-0 left-64 right-0 bg-[#0F1115]/90 backdrop-blur-md border-t border-gray-800 p-6 z-40 transition-all duration-300">
          <div className="max-w-4xl mx-auto px-4">
            <button
              onClick={handleSaveOrder}
              disabled={isSaving}
              className={`w-full flex items-center justify-between px-8 py-4 bg-blue-600 text-white rounded-xl transition-all font-medium shadow-lg shadow-blue-600/20 ${isSaving
                ? 'opacity-75 cursor-not-allowed'
                : 'hover:bg-blue-500 hover:shadow-blue-600/30 hover:-translate-y-0.5'
                }`}
            >
              <div className="flex items-center gap-3">
                <Save className="h-5 w-5" />
                <span className="text-lg">
                  {isSaving
                    ? 'Saving...'
                    : editOrderId
                      ? 'Update Order'
                      : 'Save Order'
                  }
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-blue-200">Total Amount</span>
                <span className="text-xl font-bold">
                  {totalPaidByCustomer.toFixed(2)} SAR
                </span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};