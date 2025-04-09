import { Order } from '../../types';
import { SupabaseOrder } from '../../types/supabase';

export const transformSupabaseOrder = (supabaseOrder: any): Order => ({
  id: supabaseOrder.id,
  orderNumber: supabaseOrder.order_number,
  customerName: supabaseOrder.customer_name,
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

export const transformOrderForSupabase = (order: Order): SupabaseOrder => ({
  id: order.id,
  order_number: order.orderNumber,
  customer_name: order.customerName,
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