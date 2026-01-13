import { useState, useEffect, useRef } from 'react';
import { getOrders } from '../data/orders';
import { Order } from '../types';
import { Expense } from '../types/expense';
import { BarChart3, TrendingUp, DollarSign } from 'lucide-react';
import { calculateTotalEarnings, calculateTotalProfitShare } from '../utils/profitSharing';
import { getExpenses } from '../services/expenseService';
import { Loader2 } from 'lucide-react';

// Report Components
import { SalesReport } from '../components/reports/SalesReport';
import { FinancialReport } from '../components/reports/FinancialReport';
import { ProfitSharingReport } from '../components/reports/ProfitSharingReport';
import { TotalEarningsReport } from '../components/reports/TotalEarningsReport';
import { ProductSalesReport } from '../components/reports/ProductSalesReport';
import { NetProfitReport } from '../components/reports/NetProfitReport';
import { ShippingFeeAnalysis } from '../components/reports/ShippingFeeAnalysis';
import { PaymentFeeAnalysis } from '../components/reports/PaymentFeeAnalysis';
import { ExportReportsButton } from '../components/reports/ExportReportsButton';
import { BusinessMetricsReport } from '../components/reports/BusinessMetricsReport';

interface EarningsData {
  yassirProductsCost: number;
  basimProductsCost: number;
  yassirTotalEarnings: number;
  basimTotalEarnings: number;
  combinedTotalEarnings: number;
}

interface ExpensesData {
  yassirExpenses: number;
  basimExpenses: number;
  totalExpenses: number;
}

interface ShippingFeeData {
  totalShippingFees: number;
  freeShippingCount: number;
  paidShippingCount: number;
  averageShippingFee: number;
  totalRevenue: number;
  feesAsPercentOfRevenue: number;
  byCompany: Array<{
    companyName: string;
    orderCount: number;
    totalFees: number;
    averageFee: number;
  }>;
}

interface PaymentFeeData {
  totalPaymentFees: number;
  averagePaymentFee: number;
  totalRevenue: number;
  feesAsPercentOfRevenue: number;
  averageFeePercentage: number;
  byMethod: Array<{
    methodName: string;
    orderCount: number;
    totalFees: number;
    averageFee: number;
  }>;
}

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
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [expensesData, setExpensesData] = useState<ExpensesData | null>(null);
  const [shippingFeeData, setShippingFeeData] = useState<ShippingFeeData | null>(null);
  const [paymentFeeData, setPaymentFeeData] = useState<PaymentFeeData | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activeSection, setActiveSection] = useState<string>('overview');
  const reportsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadOrders();
    loadExpenses();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedOrders = await getOrders();
      setOrders(loadedOrders);

      // Calculate earnings and fees once after orders are loaded
      await calculateEarnings(loadedOrders);
      calculateFees(loadedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      setError('Failed to load reports. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadExpenses = async () => {
    try {
      const loadedExpenses = await getExpenses();
      setExpenses(loadedExpenses);
      calculateExpenses(loadedExpenses);
    } catch (error) {
      console.error('Error loading expenses:', error);
      setExpenses([]);
      setExpensesData({ yassirExpenses: 0, basimExpenses: 0, totalExpenses: 0 });
    }
  };

  const calculateEarnings = async (ordersList: Order[]) => {
    if (!ordersList?.length) {
      setEarningsData(null);
      return;
    }

    const earnings: EarningsData = {
      yassirProductsCost: 0,
      basimProductsCost: 0,
      yassirTotalEarnings: 0,
      basimTotalEarnings: 0,
      combinedTotalEarnings: 0,
    };

    for (const order of ordersList) {
      const discountAmount = order.discount
        ? order.discount.type === 'percentage'
          ? (order.subtotal * order.discount.value) / 100
          : order.discount.value
        : 0;

      const profitSharing = await calculateTotalProfitShare(
        order.items,
        order.shippingCost,
        order.paymentFees,
        discountAmount,
        order.isFreeShipping
      );

      const orderEarnings = calculateTotalEarnings(
        order.items,
        profitSharing.totalYassirShare,
        profitSharing.totalBasimShare
      );

      earnings.yassirProductsCost += orderEarnings.yassirProductsCost;
      earnings.basimProductsCost += orderEarnings.basimProductsCost;
      earnings.yassirTotalEarnings += orderEarnings.yassirTotalEarnings;
      earnings.basimTotalEarnings += orderEarnings.basimTotalEarnings;
      earnings.combinedTotalEarnings += orderEarnings.combinedTotalEarnings;
    }

    setEarningsData(earnings);
  };

  const calculateExpenses = (expenses: Expense[]) => {
    if (!expenses.length) {
      setExpensesData({ yassirExpenses: 0, basimExpenses: 0, totalExpenses: 0 });
      return;
    }

    const yassirExpenses = expenses.reduce((sum, expense) => {
      return sum + (expense.amount * (expense.yassirSharePercentage / 100));
    }, 0);

    const basimExpenses = expenses.reduce((sum, expense) => {
      return sum + (expense.amount * (expense.basimSharePercentage / 100));
    }, 0);

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    setExpensesData({ yassirExpenses, basimExpenses, totalExpenses });
  };

  const calculateFees = (ordersList: Order[]) => {
    if (!ordersList?.length) {
      setShippingFeeData(null);
      setPaymentFeeData(null);
      return;
    }

    let totalShippingFees = 0;
    let totalPaymentFees = 0;
    let freeShippingCount = 0;
    let paidShippingCount = 0;
    let totalRevenue = 0;

    // Group by shipping company
    const companyMap = new Map<string, { orderCount: number; totalFees: number }>();
    // Group by payment method
    const paymentMethodMap = new Map<string, { orderCount: number; totalFees: number }>();

    ordersList.forEach(order => {
      // Shipping fees
      if (order.isFreeShipping) {
        freeShippingCount++;
      } else {
        paidShippingCount++;
        totalShippingFees += order.shippingCost;

        // Track by company
        const companyName = order.shippingMethod.name;
        const existing = companyMap.get(companyName) || { orderCount: 0, totalFees: 0 };
        companyMap.set(companyName, {
          orderCount: existing.orderCount + 1,
          totalFees: existing.totalFees + order.shippingCost,
        });
      }

      // Payment fees
      totalPaymentFees += order.paymentFees;

      // Track by payment method
      const methodName = order.paymentMethod.name;
      const existingMethod = paymentMethodMap.get(methodName) || { orderCount: 0, totalFees: 0 };
      paymentMethodMap.set(methodName, {
        orderCount: existingMethod.orderCount + 1,
        totalFees: existingMethod.totalFees + order.paymentFees,
      });

      // Revenue
      totalRevenue += order.total;
    });

    // Convert company map to array
    const byCompany = Array.from(companyMap.entries()).map(([companyName, data]) => ({
      companyName,
      orderCount: data.orderCount,
      totalFees: data.totalFees,
      averageFee: data.totalFees / data.orderCount,
    })).sort((a, b) => b.orderCount - a.orderCount); // Sort by order count desc

    // Convert payment method map to array
    const byMethod = Array.from(paymentMethodMap.entries()).map(([methodName, data]) => ({
      methodName,
      orderCount: data.orderCount,
      totalFees: data.totalFees,
      averageFee: data.totalFees / data.orderCount,
    })).sort((a, b) => b.orderCount - a.orderCount); // Sort by order count desc

    // Shipping fee data
    setShippingFeeData({
      totalShippingFees,
      freeShippingCount,
      paidShippingCount,
      averageShippingFee: paidShippingCount > 0 ? totalShippingFees / paidShippingCount : 0,
      totalRevenue,
      feesAsPercentOfRevenue: totalRevenue > 0 ? (totalShippingFees / totalRevenue) * 100 : 0,
      byCompany,
    });

    // Payment fee data
    setPaymentFeeData({
      totalPaymentFees,
      averagePaymentFee: totalPaymentFees / ordersList.length,
      totalRevenue,
      feesAsPercentOfRevenue: totalRevenue > 0 ? (totalPaymentFees / totalRevenue) * 100 : 0,
      averageFeePercentage: totalRevenue > 0 ? (totalPaymentFees / totalRevenue) * 100 : 0,
      byMethod,
    });
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
            earningsData={earningsData}
            expensesData={expensesData}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TotalEarningsReport
              orders={orders}
              earningsData={earningsData}
            />
            <ProfitSharingReport orders={orders} />
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
              shippingFeeData={shippingFeeData}
            />
            <PaymentFeeAnalysis
              orders={orders}
              paymentFeeData={paymentFeeData}
            />
          </div>

          {/* Combined Fee Summary */}
          {shippingFeeData && paymentFeeData && (
            <div className="bg-[#1C1F26] rounded-xl border border-gray-800 p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Combined Fee Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Total Fees</p>
                  <p className="text-2xl font-bold text-white">
                    {(shippingFeeData.totalShippingFees + paymentFeeData.totalPaymentFees).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">SAR</p>
                </div>

                <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Shipping Fees</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {shippingFeeData.totalShippingFees.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">SAR</p>
                </div>

                <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Payment Fees</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {paymentFeeData.totalPaymentFees.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">SAR</p>
                </div>

                <div className="bg-[#13151A] rounded-xl p-5 border border-gray-800">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">% of Revenue</p>
                  <p className="text-2xl font-bold text-orange-400">
                    {((shippingFeeData.totalShippingFees + paymentFeeData.totalPaymentFees) / shippingFeeData.totalRevenue * 100).toFixed(2)}%
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
          earningsData={earningsData}
          expensesData={expensesData}
          expenses={expenses}
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
      <div className="w-64 flex-shrink-0">
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