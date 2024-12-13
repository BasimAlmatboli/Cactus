import React, { useState, useEffect } from 'react';
import { getOrders } from '../data/orders';
import { Order } from '../types';
import { SalesReport } from '../components/reports/SalesReport';
import { FinancialReport } from '../components/reports/FinancialReport';
import { ProfitSharingReport } from '../components/reports/ProfitSharingReport';

export const Reports = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    try {
      setIsLoading(true);
      const loadedOrders = getOrders();
      setOrders(loadedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">Loading reports...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-8">Reports</h1>
        
        <div className="space-y-8">
          <ProfitSharingReport orders={orders} />
          <SalesReport orders={orders} />
          <FinancialReport orders={orders} />
        </div>
      </div>
    </div>
  );
};