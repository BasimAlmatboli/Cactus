import { Order } from '../types';

const ORDERS_STORAGE_KEY = 'orders';

export const getOrders = (): Order[] => {
  try {
    const savedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
    return savedOrders ? JSON.parse(savedOrders) : [];
  } catch (error) {
    console.error('Error loading orders:', error);
    return [];
  }
};

export const saveOrder = (order: Order): void => {
  try {
    const orders = getOrders();
    const existingOrderIndex = orders.findIndex(o => o.id === order.id);
    
    if (existingOrderIndex !== -1) {
      // Update existing order
      orders[existingOrderIndex] = order;
    } else {
      // Add new order
      orders.unshift(order); // Add to beginning of array
    }
    
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (error) {
    console.error('Error saving order:', error);
    throw new Error('Failed to save order');
  }
};

export const deleteOrder = (orderId: string): void => {
  try {
    const orders = getOrders().filter(order => order.id !== orderId);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (error) {
    console.error('Error deleting order:', error);
    throw new Error('Failed to delete order');
  }
};

export const getOrderById = (orderId: string): Order | null => {
  try {
    const orders = getOrders();
    return orders.find(order => order.id === orderId) || null;
  } catch (error) {
    console.error('Error getting order:', error);
    return null;
  }
};