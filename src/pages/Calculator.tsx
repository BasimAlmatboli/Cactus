import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ProductSelect } from '../components/ProductSelect';
import { ShippingSelect } from '../components/ShippingSelect';
import { PaymentSelect } from '../components/PaymentSelect';
import { OrderSummary } from '../components/OrderSummary';
import { DiscountInput } from '../components/DiscountInput';
import { Order, OrderItem, ShippingMethod, PaymentMethod, Discount } from '../types';
import { calculateMadaFees, calculateVisaFees, calculateTamaraFees } from '../utils/calculateFees';
import { saveOrder, getOrderById } from '../data/orders';

export const Calculator = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editOrderId = searchParams.get('edit');

  const [orderNumber, setOrderNumber] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isFreeShipping, setIsFreeShipping] = useState(false);
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing order if editing
  useEffect(() => {
    if (editOrderId) {
      const existingOrder = getOrderById(editOrderId);
      if (existingOrder) {
        setOrderNumber(existingOrder.orderNumber);
        setOrderItems(existingOrder.items);
        setShippingMethod(existingOrder.shippingMethod);
        setPaymentMethod(existingOrder.paymentMethod);
        setIsFreeShipping(existingOrder.isFreeShipping);
        setDiscount(existingOrder.discount);
      }
    }
  }, [editOrderId]);

  useEffect(() => {
    if (orderItems.length && shippingMethod && paymentMethod) {
      const subtotal = orderItems.reduce(
        (sum, item) => sum + item.product.sellingPrice * item.quantity,
        0
      );

      const totalCost = orderItems.reduce(
        (sum, item) => sum + item.product.cost * item.quantity,
        0
      );

      let paymentFees = 0;
      switch (paymentMethod.id) {
        case 'mada':
          paymentFees = calculateMadaFees(subtotal);
          break;
        case 'visa':
          paymentFees = calculateVisaFees(subtotal);
          break;
        case 'tamara':
          paymentFees = calculateTamaraFees(subtotal);
          break;
      }

      const discountAmount = discount
        ? discount.type === 'percentage'
          ? (subtotal * discount.value) / 100
          : discount.value
        : 0;

      const total = subtotal - discountAmount + (isFreeShipping ? 0 : shippingMethod.cost);
      const netProfit = total - totalCost - shippingMethod.cost - paymentFees;

      setOrder({
        id: editOrderId || Date.now().toString(),
        orderNumber: orderNumber,
        date: editOrderId ? (getOrderById(editOrderId)?.date || new Date().toISOString()) : new Date().toISOString(),
        items: orderItems,
        shippingMethod,
        paymentMethod,
        subtotal,
        shippingCost: shippingMethod.cost,
        paymentFees,
        discount,
        total,
        netProfit,
        isFreeShipping,
      });
    } else {
      setOrder(null);
    }
  }, [orderItems, shippingMethod, paymentMethod, isFreeShipping, discount, orderNumber, editOrderId]);

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
      saveOrder(order);
      navigate('/orders', { replace: true });
    } catch (error) {
      console.error('Error saving order:', error);
      alert('There was an error saving the order. Please try again.');
      setIsSaving(false);
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-8">
          {editOrderId ? 'Edit Order' : 'Order Profit Calculator'}
        </h1>

        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Order Details</h2>
            <input
              type="text"
              placeholder="Enter Order Number"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <ProductSelect
            orderItems={orderItems}
            onOrderItemsChange={setOrderItems}
          />
          
          <ShippingSelect
            selected={shippingMethod}
            onSelect={setShippingMethod}
            isFreeShipping={isFreeShipping}
            onFreeShippingChange={setIsFreeShipping}
          />
          
          <PaymentSelect
            selected={paymentMethod}
            onSelect={setPaymentMethod}
          />

          <DiscountInput onApplyDiscount={setDiscount} />
          
          {order && <OrderSummary order={order} />}

          {order && (
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSaveOrder}
                disabled={isSaving}
                className={`px-6 py-3 bg-green-600 text-white rounded-lg transition-colors font-medium ${
                  isSaving 
                    ? 'opacity-75 cursor-not-allowed' 
                    : 'hover:bg-green-700'
                }`}
              >
                {isSaving 
                  ? 'Saving...' 
                  : editOrderId 
                    ? 'Update Order' 
                    : 'Save Order'
                }
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};