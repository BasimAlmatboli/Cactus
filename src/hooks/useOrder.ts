import { useState, useEffect } from 'react';
import { Order, OrderItem, ShippingMethod, PaymentMethod, Discount, AppliedOffer } from '../types';
import { calculatePaymentFees } from '../utils/calculateFees';
import { calculateTotalProfitShare } from '../utils/profitSharing';
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
  const [appliedOffer, setAppliedOffer] = useState<AppliedOffer | null>(initialOrder?.appliedOffer || null);
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
    setAppliedOffer(order.appliedOffer || null);
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
    setAppliedOffer(null);
    setOrder(null);
  };

  useEffect(() => {
    const calculateOrder = async () => {
      if (orderItems.length && shippingMethod && paymentMethod) {
        const subtotal = orderItems.reduce(
          (sum, item) => sum + (item.product.sellingPrice * item.quantity),
          0
        );

        const totalCost = orderItems.reduce(
          (sum, item) => sum + item.product.cost * item.quantity,
          0
        );

        // Calculate manual discount
        const discountAmount = discount
          ? discount.type === 'percentage'
            ? (subtotal * discount.value) / 100
            : discount.value
          : 0;

        // Calculate offer discount
        const offerDiscountAmount = appliedOffer ? appliedOffer.discountAmount : 0;

        // Total discount is both manual discount and offer discount
        const totalDiscountAmount = discountAmount + offerDiscountAmount;

        // Calculate total for free shipping check
        const totalForFreeShipping = subtotal - totalDiscountAmount;

        // Auto-toggle free shipping based on total
        if (totalForFreeShipping >= freeShippingThreshold && !isFreeShipping) {
          setIsFreeShipping(true);
        } else if (totalForFreeShipping < freeShippingThreshold && isFreeShipping) {
          setIsFreeShipping(false);
        }

        // Calculate the actual shipping cost based on free shipping status
        const actualShippingCost = isFreeShipping ? 0 : shippingMethod.cost;

        // Calculate the total amount to be paid by the customer (without payment fees)
        const customerTotal = subtotal + actualShippingCost - totalDiscountAmount;

        // Calculate payment fees based on the customer total
        const paymentFees = calculatePaymentFees(paymentMethod.id, customerTotal);

        // Calculate profit sharing to get net profit (now async)
        const profitShare = await calculateTotalProfitShare(
          orderItems,
          shippingMethod.cost,
          paymentFees,
          discountAmount,
          appliedOffer,
          isFreeShipping
        );

        // Net profit is the sum of both shares
        const netProfit = profitShare.totalYassirShare + profitShare.totalBasimShare;

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
          appliedOffer,
          total: customerTotal,
          netProfit,
          isFreeShipping,
        });
      } else {
        setOrder(null);
      }
    };

    calculateOrder();
  }, [orderItems, shippingMethod, paymentMethod, isFreeShipping, discount, appliedOffer, orderNumber, customerName, currentOrderId, initialOrder, freeShippingThreshold]);

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
    appliedOffer,
    setAppliedOffer,
    order,
    setInitialOrder,
    updateShippingCost,
    resetOrder,
  };
};