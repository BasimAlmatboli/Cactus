import React from 'react';
import { OrdersList } from '../components/orders/OrdersList';
import { OrdersHeader } from '../components/orders/OrdersHeader';
import { useOrders } from '../hooks/useOrders';
import { deleteOrders } from '../services/orderService';

export const Orders = () => {
  const { orders, isLoading, error, deleteOrder, refreshOrders } = useOrders();

  const handleBatchDelete = async (orderIds: string[]) => {
    try {
      await deleteOrders(orderIds);
      await refreshOrders();
    } catch (err) {
      console.error('Error deleting orders:', err);
      alert('Failed to delete orders. Please try again.');
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto px-4">
        <OrdersHeader onOrdersImported={refreshOrders} />
        
        <OrdersList
          orders={orders}
          isLoading={isLoading}
          error={error}
          onDelete={deleteOrder}
          onBatchDelete={handleBatchDelete}
        />
      </div>
    </div>
  );
};