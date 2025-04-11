import { useState, useEffect } from 'react';
import { Order, OrderItem, ShippingMethod, PaymentMethod, Discount } from '../types';
import { calculatePaymentFees } from '../utils/calculateFees';
import { generateUUID } from '../utils/uuid';

const FREE_SHIPPING_THRESHOLD = 300;

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

  useEffect(() => {
    if (orderItems.length && shippingMethod && paymentMethod) {
      const subtotal = orderItems.reduce(
        (sum, item) => sum + (item.product.sellingPrice * item.quantity),
        0
      );

      const totalCost = orderItems.reduce(
        (sum, item) => sum + item.product.cost * item.quantity,
        0
      );

      const discountAmount = discount
        ? discount.type === 'percentage'
          ? (subtotal * discount.value) / 100
          : discount.value
        : 0;

      // Calculate total for free shipping check
      const totalForFreeShipping = subtotal - discountAmount;
      
      // Auto-toggle free shipping based on total
      if (totalForFreeShipping >= FREE_SHIPPING_THRESHOLD && !isFreeShipping) {
        setIsFreeShipping(true);
      } else if (totalForFreeShipping < FREE_SHIPPING_THRESHOLD && isFreeShipping) {
        setIsFreeShipping(false);
      }

      // Calculate the actual shipping cost based on free shipping status
      const actualShippingCost = isFreeShipping ? 0 : shippingMethod.cost;

      // Calculate the total amount to be paid by the customer (without payment fees)
      const customerTotal = subtotal + actualShippingCost - discountAmount;

      // Calculate payment fees based on the customer total
      const paymentFees = calculatePaymentFees(paymentMethod.id, customerTotal);

      // Calculate the total including payment fees (for internal use)
      const total = customerTotal + paymentFees;
      const netProfit = total - totalCost - shippingMethod.cost - paymentFees;

      setOrder({
        id: currentOrderId || generateUUID(),
        orderNumber,
        customerName: customerName || undefined,
        date: initialOrder?.date || new Date().toISOString(),
        items: orderItems,
        shippingMethod,
        paymentMethod,
        subtotal,
        shippingCost: shippingMethod.cost,
        paymentFees,
        discount,
        total: customerTotal,
        netProfit,
        isFreeShipping,
      });
    } else {
      setOrder(null);
    }
  }, [orderItems, shippingMethod, paymentMethod, isFreeShipping, discount, orderNumber, customerName, currentOrderId, initialOrder]);

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
  };
};