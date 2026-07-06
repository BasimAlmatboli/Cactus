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
  // Revenue side: what the customer is charged for shipping. Independent of carrier cost.
  const [shippingCharged, setShippingCharged] = useState<number>(
    initialOrder?.shippingCharged ?? initialOrder?.shippingCost ?? 0
  );
  const [isFreeShipping, setIsFreeShipping] = useState(initialOrder?.isFreeShipping || false);
  const [freeShippingManualMode, setFreeShippingManualMode] = useState(false);
  const [discount, setDiscount] = useState<Discount | null>(initialOrder?.discount || null);
  const [order, setOrder] = useState<Order | null>(initialOrder || null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(initialOrder?.id || null);
  // Preserve the original order date so editing never resets it to "now"
  const [orderDate, setOrderDate] = useState<string>(initialOrder?.date || new Date().toISOString());

  // Get free shipping threshold from database
  const { threshold: freeShippingThreshold } = useFreeShippingThreshold();

  // Function to set initial order data
  const setInitialOrder = (order: Order) => {
    setCurrentOrderId(order.id);
    setOrderNumber(order.orderNumber);
    setCustomerName(order.customerName || '');
    setOrderItems(order.items);
    setShippingMethod(order.shippingMethod);
    setShippingCharged(order.shippingCharged ?? order.shippingCost ?? 0);
    setPaymentMethod(order.paymentMethod);
    setIsFreeShipping(order.isFreeShipping);
    setFreeShippingManualMode(false); // Reset to automatic mode when loading order
    setDiscount(order.discount);
    setOrderDate(order.date); // ✅ Preserve the original order date
  };

  // Select a shipping method. Default the customer-charged price to the carrier
  // cost so behavior matches the old single-number flow until the user overrides it.
  const selectShippingMethod = (method: ShippingMethod) => {
    setShippingMethod(method);
    setShippingCharged(method.cost);
  };

  // Function to update the carrier cost (expense side). Does NOT touch shippingCharged.
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
    setShippingCharged(0);
    setPaymentMethod(null);
    setIsFreeShipping(false);
    setFreeShippingManualMode(false); // Reset to automatic mode
    setDiscount(null);
    setOrder(null);
    setOrderDate(new Date().toISOString()); // Reset date to now for new orders
  };

  // Wrapper to track when user manually changes free shipping
  const handleFreeShippingChange = (value: boolean) => {
    setIsFreeShipping(value);
    setFreeShippingManualMode(true); // Enable manual mode
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
          manualIsFreeShipping: freeShippingManualMode ? isFreeShipping : undefined,
          // Customer pays 0 for shipping when free; otherwise the entered price.
          shippingCharged: isFreeShipping ? 0 : shippingCharged,
        });

        // Only update free shipping automatically if not in manual mode
        if (!freeShippingManualMode && result.isFreeShipping !== isFreeShipping) {
          setIsFreeShipping(result.isFreeShipping);
        }

        // Build order object from calculation result
        setOrder({
          id: currentOrderId || generateUUID(),
          orderNumber,
          customerName: customerName || undefined,
          date: orderDate, // ✅ Uses preserved original date; never resets to "now" on edit
          items: orderItems,
          shippingMethod,
          paymentMethod,
          subtotal: result.subtotal,
          shippingCharged: result.shippingCharged, // What the customer paid for shipping (revenue)
          shippingCost: shippingMethod.cost,        // What the business pays the carrier (expense)
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
  }, [orderItems, shippingMethod, shippingCharged, paymentMethod, isFreeShipping, discount, orderNumber, customerName, currentOrderId, orderDate, freeShippingThreshold, freeShippingManualMode]);

  return {
    orderNumber,
    setOrderNumber,
    customerName,
    setCustomerName,
    orderItems,
    setOrderItems,
    shippingMethod,
    setShippingMethod: selectShippingMethod,
    shippingCharged,
    setShippingCharged,
    paymentMethod,
    setPaymentMethod,
    isFreeShipping,
    setIsFreeShipping: handleFreeShippingChange,
    discount,
    setDiscount,
    order,
    setInitialOrder,
    updateShippingCost,
    resetOrder,
  };
};