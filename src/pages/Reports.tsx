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
      <div className="min-h-screen flex items-center justify-center bg-[#0F1115]">
        <div className="flex items-center space-x-2 text-blue-500">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading reports...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 bg-[#0F1115] min-h-screen">
        <div className="max-w-[1600px] px-6">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-2 pb-32">
      <div className="max-w-[1600px] px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Reports</h1>
          <ExportReportsButton
            orders={orders}
            reportsContainerRef={reportsContainerRef}
          />
        </div>

        <div ref={reportsContainerRef} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TotalEarningsReport orders={orders} />
            <ProfitSharingReport orders={orders} />
          </div>
          <FinancialReport orders={orders} />
          <SalesReport orders={orders} />
          <ProductSalesReport orders={orders} />
        </div>
      </div>
    </div>
  );
};