import { useState, useEffect, useRef } from 'react';
import { getOrders } from '../data/orders';
import { Order } from '../types';
import { Expense } from '../types/expense';
import { BarChart3, TrendingUp, DollarSign } from 'lucide-react';
import { calculateAllReportMetrics, ReportMetrics } from '../utils/reportCalculations';
import { getExpenses } from '../services/expenseService';
import { Loader2 } from 'lucide-react';

// Report Components
import { SalesReport } from '../components/reports/sales/SalesReport';
import { FinancialReport } from '../components/reports/overview/FinancialReport';
import { ProfitSharingReport } from '../components/reports/overview/ProfitSharingReport';
import { PartnerPayoutsReport } from '../components/reports/overview/PartnerPayoutsReport';
import { ProductSalesReport } from '../components/reports/sales/ProductSalesReport';
import { NetProfitReport } from '../components/reports/overview/NetProfitReport';
import { ShippingFeeAnalysis } from '../components/reports/fees/ShippingFeeAnalysis';
import { PaymentFeeAnalysis } from '../components/reports/fees/PaymentFeeAnalysis';
import { ExportReportsButton } from '../components/reports/ExportReportsButton';
import { BusinessMetricsReport } from '../components/reports/overview/BusinessMetricsReport';

interface ReportSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

export const Reports = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activeSection, setActiveSection] = useState<string>('overview');
  const reportsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load both orders and expenses in parallel
      const [loadedOrders, loadedExpenses] = await Promise.all([
        getOrders(),
        getExpenses()
      ]);

      setOrders(loadedOrders);
      setExpenses(loadedExpenses);

      // Calculate metrics with both datasets
      if (loadedOrders.length > 0) {
        await calculateMetrics(loadedOrders, loadedExpenses);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load reports. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMetrics = async (ordersList: Order[], expensesList: Expense[]) => {
    if (!ordersList?.length) {
      setMetrics(null);
      return;
    }

    try {
      const calculatedMetrics = await calculateAllReportMetrics({
        orders: ordersList,
        expenses: expensesList
      });
      setMetrics(calculatedMetrics);
    } catch (error) {
      console.error('Error calculating metrics:', error);
      setMetrics(null);
    }
  };

  const sections: ReportSection[] = [
    {
      id: 'overview',
      title: 'Reports Overview',
      icon: <BarChart3 className="h-5 w-5" />,
      component: (
        <div ref={reportsContainerRef} className="space-y-6">
          <NetProfitReport
            orders={orders}
            metrics={metrics}
            expenses={expenses}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PartnerPayoutsReport
              orders={orders}
              metrics={metrics}
            />
            <ProfitSharingReport orders={orders} metrics={metrics} />
          </div>
          <FinancialReport orders={orders} />
          <SalesReport orders={orders} />
          <ProductSalesReport orders={orders} />
        </div>
      ),
    },
    {
      id: 'fee-analysis',
      title: 'Fee Analysis',
      icon: <DollarSign className="h-5 w-5" />,
      component: (
        <div className="space-y-6">
          <div className="space-y-6">
            <ShippingFeeAnalysis
              orders={orders}
              shippingFeeData={metrics?.shippingFeeData || null}
            />
            <PaymentFeeAnalysis
              orders={orders}
              paymentFeeData={metrics?.paymentFeeData || null}
            />
          </div>

          {/* Combined Fee Summary */}
          {metrics?.shippingFeeData && metrics?.paymentFeeData && (
            <div className="bg-[#1C1F26] rounded-xl border border-gray-800 p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Combined Fee Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Total Fees</p>
                  <p className="text-2xl font-bold text-white">
                    {(metrics.shippingFeeData.totalShippingFees + metrics.paymentFeeData.totalPaymentFees).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">SAR</p>
                </div>

                <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Shipping Fees</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {metrics.shippingFeeData.totalShippingFees.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">SAR</p>
                </div>

                <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Payment Fees</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {metrics.paymentFeeData.totalPaymentFees.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">SAR</p>
                </div>

                <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">% of Revenue</p>
                  <p className="text-2xl font-bold text-orange-400">
                    {((metrics.shippingFeeData.totalShippingFees + metrics.paymentFeeData.totalPaymentFees) / metrics.shippingFeeData.totalRevenue * 100).toFixed(2)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Impact</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'business-metrics',
      title: 'Business Metrics',
      icon: <TrendingUp className="h-5 w-5" />,
      component: (
        <BusinessMetricsReport
          orders={orders}
          metrics={metrics}
        />
      ),
    },
  ];

  const currentSection = sections.find(s => s.id === activeSection);

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
    <div className="h-full flex gap-8">
      {/* Reports Sidebar */}
      <div className="w-64 flex-shrink-0 sticky top-6 self-start">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white">Reports</h2>
        </div>

        <nav className="space-y-2">
          {sections.map((section) => {
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <div className={isActive ? 'text-white' : 'text-gray-500'}>
                  {section.icon}
                </div>
                <span className="font-medium text-sm">{section.title}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Reports Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {currentSection?.title}
            </h2>
            <p className="text-gray-400 text-sm">
              {activeSection === 'overview'
                ? 'Comprehensive overview of your business performance'
                : activeSection === 'fee-analysis'
                  ? 'Detailed analysis of shipping and payment processing fees'
                  : 'Key performance indicators and business metrics'
              }
            </p>
          </div>
          {activeSection === 'overview' && (
            <ExportReportsButton
              orders={orders}
              reportsContainerRef={reportsContainerRef}
            />
          )}
        </div>

        {/* Content */}
        <div>
          {currentSection?.component}
        </div>
      </div>
    </div>
  );
};