import React from 'react';
import { Expense } from '../../types/expense';
import { TrendingUp, RefreshCw } from 'lucide-react';

interface ExpensesSummaryReportProps {
  expenses: Expense[];
}

export const ExpensesSummaryReport: React.FC<ExpensesSummaryReportProps> = ({ expenses }) => {
  const regularExpenses = expenses.filter(e => !e.isReimbursement);
  const reimbursements = expenses.filter(e => e.isReimbursement);

  // Regular expense totals per partner (deducted from distribution)
  const basimExpenses = regularExpenses.reduce((sum, expense) => {
    return sum + (expense.amount * (expense.basimSharePercentage / 100));
  }, 0);

  const yassirExpenses = regularExpenses.reduce((sum, expense) => {
    return sum + (expense.amount * (expense.yassirSharePercentage / 100));
  }, 0);

  const totalExpenses = regularExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Reimbursement totals per partner (added to distribution)
  const basimReimbursements = reimbursements.reduce((sum, expense) => {
    return sum + (expense.amount * (expense.basimSharePercentage / 100));
  }, 0);

  const yassirReimbursements = reimbursements.reduce((sum, expense) => {
    return sum + (expense.amount * (expense.yassirSharePercentage / 100));
  }, 0);

  const totalReimbursements = reimbursements.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="bg-[#1C1F26] rounded-xl border border-gray-800 p-6 mt-6">
      <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <TrendingUp className="h-6 w-6 text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">Expense Summary</h2>
      </div>

      {/* Regular Expenses */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Operating Expenses (Deducted from distribution)</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#13151A] rounded-xl p-5 border border-blue-500/20 group hover:border-blue-500/40 transition-colors">
            <p className="text-sm font-medium text-blue-400 mb-2 uppercase tracking-wider">Basim's Expenses</p>
            <p className="text-2xl font-bold text-white">
              {basimExpenses.toFixed(2)} <span className="text-lg text-gray-500 font-medium">SAR</span>
            </p>
          </div>

          <div className="bg-[#13151A] rounded-xl p-5 border border-purple-500/20 group hover:border-purple-500/40 transition-colors">
            <p className="text-sm font-medium text-purple-400 mb-2 uppercase tracking-wider">Yassir's Expenses</p>
            <p className="text-2xl font-bold text-white">
              {yassirExpenses.toFixed(2)} <span className="text-lg text-gray-500 font-medium">SAR</span>
            </p>
          </div>

          <div className="bg-[#13151A] rounded-xl p-5 border border-gray-700/50 group hover:border-gray-600 transition-colors">
            <p className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">Total Expenses</p>
            <p className="text-2xl font-bold text-white">
              {totalExpenses.toFixed(2)} <span className="text-lg text-gray-500 font-medium">SAR</span>
            </p>
          </div>
        </div>
      </div>

      {/* Reimbursements — only shown if any exist */}
      {totalReimbursements > 0 && (
        <div className="pt-4 border-t border-gray-800/50">
          <div className="flex items-center gap-2 mb-3">
            <RefreshCw className="h-4 w-4 text-emerald-400" />
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Reimbursements (Added to distribution)</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#13151A] rounded-xl p-5 border border-emerald-500/20 group hover:border-emerald-500/40 transition-colors">
              <p className="text-sm font-medium text-emerald-400 mb-2 uppercase tracking-wider">Basim Gets Back</p>
              <p className="text-2xl font-bold text-emerald-300">
                +{basimReimbursements.toFixed(2)} <span className="text-lg text-gray-500 font-medium">SAR</span>
              </p>
            </div>

            <div className="bg-[#13151A] rounded-xl p-5 border border-teal-500/20 group hover:border-teal-500/40 transition-colors">
              <p className="text-sm font-medium text-teal-400 mb-2 uppercase tracking-wider">Yassir Gets Back</p>
              <p className="text-2xl font-bold text-teal-300">
                +{yassirReimbursements.toFixed(2)} <span className="text-lg text-gray-500 font-medium">SAR</span>
              </p>
            </div>

            <div className="bg-[#13151A] rounded-xl p-5 border border-gray-700/50 group hover:border-gray-600 transition-colors">
              <p className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">Total Reimbursements</p>
              <p className="text-2xl font-bold text-emerald-300">
                +{totalReimbursements.toFixed(2)} <span className="text-lg text-gray-500 font-medium">SAR</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
