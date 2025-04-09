import React, { useState, useEffect, useRef } from 'react';
import { getOrders } from '../data/orders';
import { Order } from '../types';
import { SalesReport } from '../components/reports/SalesReport';
import { FinancialReport } from '../components/reports/FinancialReport';
import { ProfitSharingReport } from '../components/reports/ProfitSharingReport';
import { TotalEarningsReport } from '../components/reports/TotalEarningsReport';
import { ProductSalesReport } from '../components/reports/ProductSalesReport';
import { ExportReportsButton } from '../components/reports/ExportReportsButton';
import { Loader2 } from 'lucide-react';

export const Reports = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reportsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedOrders = await getOrders();
      setOrders(loadedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      setError('Failed to load reports. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2 text-blue-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading reports...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Reports</h1>
          <ExportReportsButton 
            orders={orders}
            reportsContainerRef={reportsContainerRef}
          />
        </div>
        
        <div ref={reportsContainerRef} className="space-y-8">
          <TotalEarningsReport orders={orders} />
          <ProfitSharingReport orders={orders} />
          <ProductSalesReport orders={orders} />
          <SalesReport orders={orders} />
          <FinancialReport orders={orders} />
        </div>
      </div>
    </div>
  );
};