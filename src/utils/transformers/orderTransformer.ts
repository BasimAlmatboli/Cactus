import { Order } from '../../types';
import { SupabaseOrder } from '../../types/supabase';

/**
 * Transform Supabase Order to Application Order
 * 
 * Converts database snake_case format to application camelCase format.
 * Used when fetching orders from Supabase.
 * 
 * Example:
 * Input (Supabase):
 * {
 *   order_number: "12345",
 *   customer_name: "Ahmed",
 *   shipping_cost: 15,
 *   is_free_shipping: true
 * }
 * 
 * Output (Application):
 * {
 *   orderNumber: "12345",
 *   customerName: "Ahmed",
 *   shippingCost: 15,
 *   isFreeShipping: true
 * }
 * 
 * @param supabaseOrder - Order from Supabase database (snake_case)
 * @returns Order in application format (camelCase)
 */
export const transformSupabaseOrder = (supabaseOrder: SupabaseOrder): Order => ({
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

/**
 * Transform Application Order to Supabase Order
 * 
 * Converts application camelCase format to database snake_case format.
 * Used when saving orders to Supabase.
 * 
 * Example:
 * Input (Application):
 * {
 *   orderNumber: "12345",
 *   customerName: "Ahmed",
 *   shippingCost: 15,
 *   isFreeShipping: true
 * }
 * 
 * Output (Supabase):
 * {
 *   order_number: "12345",
 *   customer_name: "Ahmed",
 *   shipping_cost: 15,
 *   is_free_shipping: true
 * }
 * 
 * @param order - Order in application format (camelCase)
 * @returns Order for Supabase database (snake_case)
 */
export const transformOrderForSupabase = (order: Order): SupabaseOrder => ({
  id: order.id,
  order_number: order.orderNumber,
  customer_name: order.customerName,
  created_at: order.date,  // ✅ FIXED: Was missing - prevents data loss!
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