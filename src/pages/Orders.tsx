import React, { useState } from 'react';
import { OrdersList } from '../components/orders/OrdersList';
import { OrdersHeader } from '../components/orders/OrdersHeader';
import { useOrders } from '../hooks/useOrders';
import { deleteOrders, recalculateOrders, recalculateAllOrders } from '../services/orderService';

export const Orders = () => {
  const { orders, isLoading, error, deleteOrder, refreshOrders } = useOrders();
  const [isRecalculating, setIsRecalculating] = useState(false);

  const handleBatchDelete = async (orderIds: string[]) => {
    try {
      await deleteOrders(orderIds);
      await refreshOrders();
    } catch (err) {
      console.error('Error deleting orders:', err);
      alert('Failed to delete orders. Please try again.');
    }
  };

  const handleBatchRecalculate = async (orderIds: string[]) => {
    if (orderIds.length === 0) {
      alert('Please select at least one order to recalculate.');
      return;
    }

    if (!window.confirm(`Recalculate ${orderIds.length} order(s) with current offers? This will:\n\n• Reset product prices to defaults\n• Apply best available offers\n• Recalculate totals and profit\n\nContinue?`)) {
      return;
    }

    try {
      setIsRecalculating(true);
      const updatedCount = await recalculateOrders(orderIds);
      await refreshOrders();
      alert(`Successfully recalculated ${updatedCount} order(s).`);
    } catch (err) {
      console.error('Error recalculating orders:', err);
      alert('Failed to recalculate orders. Please try again.');
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleRecalculateAll = async () => {
    if (orders.length === 0) {
      alert('No orders to recalculate.');
      return;
    }

    if (!window.confirm(`Recalculate all ${orders.length} order(s) with current offers? This will:\n\n• Reset product prices to defaults\n• Apply best available offers\n• Recalculate totals and profit\n\nContinue?`)) {
      return;
    }

    try {
      setIsRecalculating(true);
      const updatedCount = await recalculateAllOrders();
      await refreshOrders();
      alert(`Successfully recalculated ${updatedCount} order(s).`);
    } catch (err) {
      console.error('Error recalculating all orders:', err);
      alert('Failed to recalculate orders. Please try again.');
    } finally {
      setIsRecalculating(false);
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
          onBatchRecalculate={handleBatchRecalculate}
          onRecalculateAll={handleRecalculateAll}
          isRecalculating={isRecalculating}
        />
      </div>
    </div>
  );
};