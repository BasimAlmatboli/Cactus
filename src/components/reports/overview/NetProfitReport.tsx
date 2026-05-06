import React from 'react';
import { Order } from '../../../types';
import { Expense } from '../../../types/expense';
import { TrendingUp, Loader2, DollarSign, Receipt, Wallet, Copy, RefreshCw } from 'lucide-react';
import { ReportMetrics } from '../../../utils/reportCalculations';

interface NetProfitReportProps {
    orders: Order[];
    metrics: ReportMetrics | null;
    expenses: Expense[];
}

export const NetProfitReport: React.FC<NetProfitReportProps> = ({
    orders,
    metrics,
    expenses
}) => {
    // Get net profit data from metrics
    const netProfitData = metrics?.partnerNetProfit;

    // Regular expenses (deducted) per partner
    const yassirExpensesList = React.useMemo(() => {
        if (!expenses) return [];
        return expenses
            .filter(e => e.yassirSharePercentage > 0 && !e.isReimbursement)
            .map(e => ({
                description: e.description,
                amount: e.amount * (e.yassirSharePercentage / 100)
            }))
            .sort((a, b) => b.amount - a.amount);
    }, [expenses]);

    const basimExpensesList = React.useMemo(() => {
        if (!expenses) return [];
        return expenses
            .filter(e => e.basimSharePercentage > 0 && !e.isReimbursement)
            .map(e => ({
                description: e.description,
                amount: e.amount * (e.basimSharePercentage / 100)
            }))
            .sort((a, b) => b.amount - a.amount);
    }, [expenses]);

    // Reimbursements (added) per partner
    const yassirReimbursementsList = React.useMemo(() => {
        if (!expenses) return [];
        return expenses
            .filter(e => e.yassirSharePercentage > 0 && e.isReimbursement)
            .map(e => ({
                description: e.description,
                amount: e.amount * (e.yassirSharePercentage / 100)
            }))
            .sort((a, b) => b.amount - a.amount);
    }, [expenses]);

    const basimReimbursementsList = React.useMemo(() => {
        if (!expenses) return [];
        return expenses
            .filter(e => e.basimSharePercentage > 0 && e.isReimbursement)
            .map(e => ({
                description: e.description,
                amount: e.amount * (e.basimSharePercentage / 100)
            }))
            .sort((a, b) => b.amount - a.amount);
    }, [expenses]);

    if (!metrics) {
        return (
            <div className="bg-[#1C1F26] rounded-xl border border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-green-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">Monthly Partner Distributions</h2>
                </div>
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                </div>
            </div>
        );
    }

    if (!orders?.length) {
        return (
            <div className="bg-[#1C1F26] rounded-xl border border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-green-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">Monthly Partner Distributions</h2>
                </div>
                <p className="text-gray-500">No orders found.</p>
            </div>
        );
    }

    return (
        <div className="bg-[#1C1F26] rounded-xl border border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
                <div className="p-2 bg-green-500/10 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Monthly Partner Distributions</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Yassir's Net Profit */}
                <div className="bg-[#13151A] rounded-xl border border-gray-800 overflow-hidden">
                    <div className="bg-blue-500/10 border-b border-blue-500/20 px-5 py-3">
                        <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Yassir's Net Distribution</h3>
                    </div>
                    <div className="p-5 space-y-4">
                        {/* Earnings */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Wallet className="h-4 w-4 text-blue-400" />
                                <span className="text-sm text-gray-400">Earnings</span>
                            </div>
                            <span className="text-base font-medium text-white">
                                {metrics.earnings.yassirTotalEarnings.toFixed(2)} SAR
                            </span>
                        </div>

                        {/* Regular Expenses (deducted) */}
                        {yassirExpensesList.length > 0 && (
                            <div className="space-y-2 mb-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <Receipt className="h-4 w-4 text-red-400" />
                                    <span className="text-sm text-gray-400">Expenses</span>
                                </div>
                                <div className="bg-[#0D0F12] rounded-lg p-3 space-y-2 max-h-36 overflow-y-auto custom-scrollbar">
                                    {yassirExpensesList.map((expense, index) => (
                                        <div key={index} className="flex justify-between items-start text-xs group">
                                            <span className="text-gray-400 group-hover:text-gray-300 transition-colors">{expense.description}</span>
                                            <span className="text-red-400 font-medium whitespace-nowrap ml-2">
                                                -{expense.amount.toFixed(2)} SAR
                                            </span>
                                        </div>
                                    ))}
                                    <div className="border-t border-gray-800 pt-2 mt-2 flex justify-between items-center">
                                        <span className="text-xs text-gray-500 font-medium">Total Expenses</span>
                                        <span className="text-xs text-red-400 font-bold">-{metrics.expenses.yassirExpenses.toFixed(2)} SAR</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Reimbursements (added) */}
                        {yassirReimbursementsList.length > 0 && (
                            <div className="space-y-2 mb-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <RefreshCw className="h-4 w-4 text-emerald-400" />
                                    <span className="text-sm text-gray-400">Reimbursements</span>
                                </div>
                                <div className="bg-emerald-900/10 border border-emerald-800/30 rounded-lg p-3 space-y-2 max-h-36 overflow-y-auto custom-scrollbar">
                                    {yassirReimbursementsList.map((reimb, index) => (
                                        <div key={index} className="flex justify-between items-start text-xs group">
                                            <span className="text-gray-400 group-hover:text-gray-300 transition-colors">{reimb.description}</span>
                                            <span className="text-emerald-400 font-medium whitespace-nowrap ml-2">
                                                +{reimb.amount.toFixed(2)} SAR
                                            </span>
                                        </div>
                                    ))}
                                    <div className="border-t border-emerald-800/30 pt-2 mt-2 flex justify-between items-center">
                                        <span className="text-xs text-gray-500 font-medium">Total Reimbursements</span>
                                        <span className="text-xs text-emerald-400 font-bold">+{metrics.expenses.yassirReimbursements.toFixed(2)} SAR</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Divider */}
                        <div className="border-t border-gray-700/50"></div>

                        {/* Net Distribution */}
                        <div className="flex items-center justify-between bg-blue-500/5 rounded-lg p-3 border border-blue-500/10">
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-blue-400" />
                                <span className="text-sm font-semibold text-blue-300">Net Distribution</span>
                            </div>
                            <span className={`text-xl font-bold ${netProfitData!.yassirNetProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {netProfitData!.yassirNetProfit.toFixed(2)} SAR
                            </span>
                        </div>
                    </div>
                </div>

                {/* Basim's Net Profit */}
                <div className="bg-[#13151A] rounded-xl border border-gray-800 overflow-hidden">
                    <div className="bg-green-500/10 border-b border-green-500/20 px-5 py-3 flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wider">Basim's Net Distribution</h3>
                        <button
                            onClick={() => {
                                const date = new Date();
                                const month = date.toLocaleString('default', { month: 'numeric' });
                                const expensesText = basimExpensesList
                                    .map((e, i) => `\u200F${i + 1}. ${e.description} (${e.amount.toFixed(2)} ر.س)`)
                                    .join('\n');
                                const reimbText = basimReimbursementsList.length > 0
                                    ? '\n\n\u200Fالمصاريف الشخصية (تُضاف):\n' + basimReimbursementsList
                                        .map((r, i) => `\u200F${i + 1}. ${r.description} (+${r.amount.toFixed(2)} ر.س)`)
                                        .join('\n')
                                    : '';

                                const text = `\u200Fتوزيع أرباح شهر ${month}:\n\n\u200F${metrics.earnings.basimTotalEarnings.toFixed(2)} ر.س\n\n\u200Fالتكاليف:\n${expensesText}\n\n\u200Fالإجمالي: ${metrics.expenses.basimExpenses.toFixed(2)} ر.س${reimbText}\n\n\u200Fصافي أرباح باسم بعد خصم التكاليف:\n\u200F${netProfitData!.basimNetProfit.toFixed(2)} ر.س`;

                                navigator.clipboard.writeText(text);
                            }}
                            className="p-1.5 hover:bg-green-500/20 rounded-lg transition-colors group"
                            title="Copy Arabic Report"
                        >
                            <Copy className="h-4 w-4 text-green-400 group-hover:text-green-300" />
                        </button>
                    </div>
                    <div className="p-5 space-y-4">
                        {/* Earnings */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Wallet className="h-4 w-4 text-green-400" />
                                <span className="text-sm text-gray-400">Earnings</span>
                            </div>
                            <span className="text-base font-medium text-white">
                                {metrics.earnings.basimTotalEarnings.toFixed(2)} SAR
                            </span>
                        </div>

                        {/* Regular Expenses (deducted) */}
                        {basimExpensesList.length > 0 && (
                            <div className="space-y-2 mb-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <Receipt className="h-4 w-4 text-red-400" />
                                    <span className="text-sm text-gray-400">Expenses</span>
                                </div>
                                <div className="bg-[#0D0F12] rounded-lg p-3 space-y-2 max-h-36 overflow-y-auto custom-scrollbar">
                                    {basimExpensesList.map((expense, index) => (
                                        <div key={index} className="flex justify-between items-start text-xs group">
                                            <span className="text-gray-400 group-hover:text-gray-300 transition-colors">{expense.description}</span>
                                            <span className="text-red-400 font-medium whitespace-nowrap ml-2">
                                                -{expense.amount.toFixed(2)} SAR
                                            </span>
                                        </div>
                                    ))}
                                    <div className="border-t border-gray-800 pt-2 mt-2 flex justify-between items-center">
                                        <span className="text-xs text-gray-500 font-medium">Total Expenses</span>
                                        <span className="text-xs text-red-400 font-bold">-{metrics.expenses.basimExpenses.toFixed(2)} SAR</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Reimbursements (added) */}
                        {basimReimbursementsList.length > 0 && (
                            <div className="space-y-2 mb-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <RefreshCw className="h-4 w-4 text-emerald-400" />
                                    <span className="text-sm text-gray-400">Reimbursements</span>
                                </div>
                                <div className="bg-emerald-900/10 border border-emerald-800/30 rounded-lg p-3 space-y-2 max-h-36 overflow-y-auto custom-scrollbar">
                                    {basimReimbursementsList.map((reimb, index) => (
                                        <div key={index} className="flex justify-between items-start text-xs group">
                                            <span className="text-gray-400 group-hover:text-gray-300 transition-colors">{reimb.description}</span>
                                            <span className="text-emerald-400 font-medium whitespace-nowrap ml-2">
                                                +{reimb.amount.toFixed(2)} SAR
                                            </span>
                                        </div>
                                    ))}
                                    <div className="border-t border-emerald-800/30 pt-2 mt-2 flex justify-between items-center">
                                        <span className="text-xs text-gray-500 font-medium">Total Reimbursements</span>
                                        <span className="text-xs text-emerald-400 font-bold">+{metrics.expenses.basimReimbursements.toFixed(2)} SAR</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Divider */}
                        <div className="border-t border-gray-700/50"></div>

                        {/* Net Distribution */}
                        <div className="flex items-center justify-between bg-green-500/5 rounded-lg p-3 border border-green-500/10">
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-green-400" />
                                <span className="text-sm font-semibold text-green-300">Net Distribution</span>
                            </div>
                            <span className={`text-xl font-bold ${netProfitData!.basimNetProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {netProfitData!.basimNetProfit.toFixed(2)} SAR
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Combined Summary */}
            <div className="mt-6 bg-gradient-to-br from-emerald-900/20 to-teal-900/20 rounded-xl p-6 border border-emerald-500/20">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                        <p className="text-xs text-emerald-400/60 uppercase tracking-wider mb-2">Total Earnings</p>
                        <p className="text-2xl font-bold text-emerald-300">
                            {metrics.earnings.combinedTotalEarnings.toFixed(2)} <span className="text-sm text-emerald-400/60 font-medium">SAR</span>
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-red-400/60 uppercase tracking-wider mb-2">Total Expenses</p>
                        <p className="text-2xl font-bold text-red-300">
                            {metrics.expenses.totalExpenses.toFixed(2)} <span className="text-sm text-red-400/60 font-medium">SAR</span>
                        </p>
                    </div>
                    {metrics.expenses.totalReimbursements > 0 && (
                        <div>
                            <p className="text-xs text-emerald-400/60 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <RefreshCw className="h-3 w-3" /> Reimbursements
                            </p>
                            <p className="text-2xl font-bold text-emerald-300">
                                +{metrics.expenses.totalReimbursements.toFixed(2)} <span className="text-sm text-emerald-400/60 font-medium">SAR</span>
                            </p>
                        </div>
                    )}
                    <div>
                        <p className="text-xs text-emerald-400/60 uppercase tracking-wider mb-2">Total Available for Distribution</p>
                        <p className={`text-2xl font-bold ${netProfitData!.combinedNetProfit >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                            {netProfitData!.combinedNetProfit.toFixed(2)} <span className="text-sm text-emerald-400/60 font-medium">SAR</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
