import { Order, OrderItem, Offer, AppliedOffer } from '../types';
import { supabase } from '../lib/supabase';
import { generateUUID } from '../utils/uuid';
import { transformOrderForSupabase, transformSupabaseOrder } from '../utils/transformers/orderTransformer';
import { getActiveOffers } from './offerService';
import { findApplicableOffers, getBestOffer, applyOfferToItems } from '../utils/offerHelpers';
import { calculatePaymentFees } from '../utils/calculateFees';
import { getProducts } from '../data/products';
import { getCachedFreeShippingThreshold } from './settingsService';

export const getOrders = async (): Promise<Order[]> => {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading orders:', error);
    throw error;
  }

  return orders.map(transformSupabaseOrder);
};

export const saveOrder = async (order: Order): Promise<void> => {
  const orderToSave = {
    ...order,
    id: order.id || generateUUID(),
  };

  const supabaseOrder = transformOrderForSupabase(orderToSave);

  const { error } = await supabase
    .from('orders')
    .upsert(supabaseOrder, {
      onConflict: 'id',
      ignoreDuplicates: false,
    });

  if (error) {
    console.error('Error saving order:', error);
    throw error;
  }
};

export const deleteOrder = async (orderId: string): Promise<void> => {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId);

  if (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

export const deleteOrders = async (orderIds: string[]): Promise<void> => {
  const { error } = await supabase
    .from('orders')
    .delete()
    .in('id', orderIds);

  if (error) {
    console.error('Error deleting orders:', error);
    throw error;
  }
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .maybeSingle();

  if (error) {
    console.error('Error getting order:', error);
    throw error;
  }

  return order ? transformSupabaseOrder(order) : null;
};



const getProductById = async (productId: string): Promise<any> => {
  const products = await getProducts();
  return products.find(p => p.id === productId);
};

const recalculateOrderWithOffers = async (order: Order, activeOffers: Offer[]): Promise<Order> => {
  const { items, shippingMethod, paymentMethod, isFreeShipping: originalFreeShipping } = order;

  // Get current product prices from database
  const orderItems = await Promise.all(items.map(async item => ({
    ...item,
    product: {
      ...item.product,
      sellingPrice: (await getProductById(item.product.id))?.sellingPrice || item.product.sellingPrice,
    }
  })));

  const subtotal = orderItems.reduce(
    (sum, item) => sum + (item.product.sellingPrice * item.quantity),
    0
  );

  const applicableOffers = findApplicableOffers(orderItems, activeOffers);
  let appliedOffer: AppliedOffer | null = null;

  if (applicableOffers.length > 0) {
    const bestOffer = getBestOffer(orderItems, applicableOffers);
    if (bestOffer) {
      const offerResult = applyOfferToItems(orderItems, bestOffer);
      appliedOffer = offerResult.appliedOffer;
    }
  }

  const totalCost = items.reduce(
    (sum, item) => sum + item.product.cost * item.quantity,
    0
  );

  const offerDiscountAmount = appliedOffer ? appliedOffer.discountAmount : 0;
  const totalForFreeShipping = subtotal - offerDiscountAmount;

  // Get free shipping threshold from database
  const freeShippingThreshold = await getCachedFreeShippingThreshold();

  let isFreeShipping = originalFreeShipping;
  if (totalForFreeShipping >= freeShippingThreshold && !originalFreeShipping) {
    isFreeShipping = true;
  } else if (totalForFreeShipping < freeShippingThreshold && originalFreeShipping) {
    isFreeShipping = false;
  }

  const actualShippingCost = isFreeShipping ? 0 : shippingMethod.cost;
  const customerTotal = subtotal + actualShippingCost - offerDiscountAmount;
  const paymentFees = calculatePaymentFees(paymentMethod.id, customerTotal);
  const total = customerTotal + paymentFees;
  const netProfit = total - totalCost - shippingMethod.cost - paymentFees;

  return {
    ...order,
    subtotal,
    shippingCost: shippingMethod.cost,
    paymentFees,
    appliedOffer,
    total: customerTotal,
    netProfit,
    isFreeShipping,
    items: orderItems,
  };
};

export const recalculateOrder = async (orderId: string): Promise<Order> => {
  const order = await getOrderById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  const activeOffers = await getActiveOffers();
  const recalculatedOrder = await recalculateOrderWithOffers(order, activeOffers);

  await saveOrder(recalculatedOrder);
  return recalculatedOrder;
};

export const recalculateOrders = async (orderIds: string[]): Promise<number> => {
  try {
    const activeOffers = await getActiveOffers();
    let updatedCount = 0;

    for (const orderId of orderIds) {
      try {
        const order = await getOrderById(orderId);
        if (order) {
          const recalculatedOrder = await recalculateOrderWithOffers(order, activeOffers);
          await saveOrder(recalculatedOrder);
          updatedCount++;
        }
      } catch (error) {
        console.error(`Error recalculating order ${orderId}:`, error);
      }
    }

    return updatedCount;
  } catch (error) {
    console.error('Error in recalculateOrders:', error);
    throw error;
  }
};

export const recalculateAllOrders = async (): Promise<number> => {
  try {
    const orders = await getOrders();
    return recalculateOrders(orders.map(o => o.id));
  } catch (error) {
    console.error('Error in recalculateAllOrders:', error);
    throw error;
  }
};