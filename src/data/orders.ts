import { Order } from '../types';
import { supabase } from '../lib/supabase';

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
  const supabaseOrder = transformOrderForSupabase(order);

  const { error } = await supabase
    .from('orders')
    .upsert(supabaseOrder);

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

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error) {
    console.error('Error getting order:', error);
    throw error;
  }

  return order ? transformSupabaseOrder(order) : null;
};

// Helper functions to transform data between app and Supabase formats
const transformSupabaseOrder = (supabaseOrder: any): Order => ({
  id: supabaseOrder.id,
  orderNumber: supabaseOrder.order_number,
  date: supabaseOrder.created_at,
  items: supabaseOrder.items,
  shippingMethod: supabaseOrder.shipping_method,
  paymentMethod: supabaseOrder.payment_method,
  subtotal: supabaseOrder.subtotal,
  shippingCost: supabaseOrder.shipping_cost,
  paymentFees: supabaseOrder.payment_fees,
  discount: supabaseOrder.discount,
  total: supabaseOrder.total,
  netProfit: supabaseOrder.net_profit,
  isFreeShipping: supabaseOrder.is_free_shipping,
});

const transformOrderForSupabase = (order: Order) => ({
  id: order.id,
  order_number: order.orderNumber,
  items: order.items,
  shipping_method: order.shippingMethod,
  payment_method: order.paymentMethod,
  subtotal: order.subtotal,
  shipping_cost: order.shippingCost,
  payment_fees: order.paymentFees,
  discount: order.discount,
  total: order.total,
  net_profit: order.netProfit,
  is_free_shipping: order.isFreeShipping,
});