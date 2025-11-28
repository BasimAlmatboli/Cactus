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
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Expense Summary</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm font-medium text-blue-600 mb-1">Basim's Total Expenses</p>
          <p className="text-2xl font-bold text-blue-900">
            {basimTotal.toFixed(2)} SAR
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm font-medium text-green-600 mb-1">Yassir's Total Expenses</p>
          <p className="text-2xl font-bold text-green-900">
            {yassirTotal.toFixed(2)} SAR
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-sm font-medium text-gray-600 mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-gray-900">
            {totalExpenses.toFixed(2)} SAR
          </p>
        </div>
      </div>
    </div>
  );
};
