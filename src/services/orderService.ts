import { Order } from '../types';
import { supabase } from '../lib/supabase';
import { generateUUID } from '../utils/uuid';
import { transformOrderForSupabase, transformSupabaseOrder } from '../utils/transformers/orderTransformer';

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
    .single();

  if (error) {
    console.error('Error getting order:', error);
    throw error;
  }

  return order ? transformSupabaseOrder(order) : null;
};