import { useState, useEffect, useCallback } from 'react';
import { Order } from '../types';
import * as orderService from '../services/orderService';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedOrders = await orderService.getOrders();
      setOrders(loadedOrders);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const deleteOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await orderService.deleteOrder(orderId);
        await loadOrders();
      } catch (err) {
        console.error('Error deleting order:', err);
        alert('Failed to delete order. Please try again.');
      }
    }
  };

  const refreshOrders = async () => {
    await loadOrders();
  };

  return {
    orders,
    isLoading,
    error,
    deleteOrder,
    refreshOrders,
  };
};