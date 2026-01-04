import React from 'react';
import { Expense } from '../../types/expense';
import { TrendingUp } from 'lucide-react';

interface ExpensesSummaryReportProps {
  expenses: Expense[];
}

export const ExpensesSummaryReport: React.FC<ExpensesSummaryReportProps> = ({ expenses }) => {
  // Calculate totals
  const basimTotal = expenses.reduce((sum, expense) => {
    if (expense.owner === 'basim') return sum + expense.amount;
    if (expense.owner === 'shared') return sum + (expense.amount / 2);
    return sum;
  }, 0);

  const yassirTotal = expenses.reduce((sum, expense) => {
    if (expense.owner === 'yassir') return sum + expense.amount;
    if (expense.owner === 'shared') return sum + (expense.amount / 2);
    return sum;
  }, 0);

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="bg-[#1C1F26] rounded-xl border border-gray-800 p-6 mt-6">
      <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <TrendingUp className="h-6 w-6 text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">Expense Summary</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#13151A] rounded-xl p-5 border border-blue-500/20 group hover:border-blue-500/40 transition-colors">
          <p className="text-sm font-medium text-blue-400 mb-2 uppercase tracking-wider">Basim's Total Expenses</p>
          <p className="text-2xl font-bold text-white">
            {basimTotal.toFixed(2)} <span className="text-lg text-gray-500 font-medium">SAR</span>
          </p>
        </div>

        <div className="bg-[#13151A] rounded-xl p-5 border border-green-500/20 group hover:border-green-500/40 transition-colors">
          <p className="text-sm font-medium text-green-400 mb-2 uppercase tracking-wider">Yassir's Total Expenses</p>
          <p className="text-2xl font-bold text-white">
            {yassirTotal.toFixed(2)} <span className="text-lg text-gray-500 font-medium">SAR</span>
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
  );
};
