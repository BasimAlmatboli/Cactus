import { useState, useEffect } from 'react';
import { Order, OrderItem, ShippingMethod, PaymentMethod, Discount } from '../types';
import { calculateCompleteOrder } from '../utils/orderCalculations';
import { generateUUID } from '../utils/uuid';
import { useFreeShippingThreshold } from './useFreeShippingThreshold';



export const useOrder = (initialOrder?: Order | null) => {
  const [orderNumber, setOrderNumber] = useState(initialOrder?.orderNumber || '');
  const [customerName, setCustomerName] = useState(initialOrder?.customerName || '');
  const [orderItems, setOrderItems] = useState<OrderItem[]>(initialOrder?.items || []);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod | null>(
    initialOrder?.shippingMethod || null
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    initialOrder?.paymentMethod || null
  );
  const [isFreeShipping, setIsFreeShipping] = useState(initialOrder?.isFreeShipping || false);
  const [discount, setDiscount] = useState<Discount | null>(initialOrder?.discount || null);
  const [order, setOrder] = useState<Order | null>(initialOrder || null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(initialOrder?.id || null);

  // Get free shipping threshold from database
  const { threshold: freeShippingThreshold } = useFreeShippingThreshold();

  // Function to set initial order data
  const setInitialOrder = (order: Order) => {
    setCurrentOrderId(order.id);
    setOrderNumber(order.orderNumber);
    setCustomerName(order.customerName || '');
    setOrderItems(order.items);
    setShippingMethod(order.shippingMethod);
    setPaymentMethod(order.paymentMethod);
    setIsFreeShipping(order.isFreeShipping);
    setDiscount(order.discount);
  };

  // Function to update shipping cost
  const updateShippingCost = (cost: number) => {
    if (shippingMethod) {
      setShippingMethod({
        ...shippingMethod,
        cost
      });
    }
  };

  // Function to reset all order fields
  const resetOrder = () => {
    setCurrentOrderId(null);
    setOrderNumber('');
    setCustomerName('');
    setOrderItems([]);
    setShippingMethod(null);
    setPaymentMethod(null);
    setIsFreeShipping(false);
    setDiscount(null);
    setOrder(null);
  };

  useEffect(() => {
    const calculateOrder = async () => {
      if (orderItems.length && shippingMethod && paymentMethod) {
        // ✅ USE CENTRALIZED CALCULATION FUNCTION
        // All business logic is now in ONE place: orderCalculations/completeOrder.ts
        const result = await calculateCompleteOrder({
          orderItems,
          shippingMethod,
          paymentMethod,
          discount,
          freeShippingThreshold,
        });

        // Update free shipping state if it changed based on calculation
        if (result.isFreeShipping !== isFreeShipping) {
          setIsFreeShipping(result.isFreeShipping);
        }

        // Build order object from calculation result
        setOrder({
          id: currentOrderId || generateUUID(),
          orderNumber,
          customerName: customerName || undefined,
          date: initialOrder?.date || new Date().toISOString(),
          items: orderItems,
          shippingMethod,
          paymentMethod,
          subtotal: result.subtotal,
          shippingCost: shippingMethod.cost, // Store original cost (not actual)
          paymentFees: result.paymentFees,
          discount,
          total: result.customerTotal, // What customer pays
          netProfit: result.netProfit,
          isFreeShipping: result.isFreeShipping,
        });
      } else {
        setOrder(null);
      }
    };

    calculateOrder();
  }, [orderItems, shippingMethod, paymentMethod, isFreeShipping, discount, orderNumber, customerName, currentOrderId, initialOrder, freeShippingThreshold]);

  return {
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
    updateShippingCost,
    resetOrder,
  };
};