import React, { useState } from 'react';
import { Expense } from '../../types/expense';
import { expenseCategories } from '../../data/expenseCategories';
import { Trash2, Loader2, Pencil, RefreshCw } from 'lucide-react';
import * as Icons from 'lucide-react';
import { ExpenseEditModal } from './ExpenseEditModal';

interface ExpenseListProps {
  expenses: Expense[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, expense: Omit<Expense, 'id'>) => Promise<void>;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  isLoading,
  onDelete,
  onUpdate
}) => {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const handleEditClick = (expense: Expense) => {
    setEditingExpense(expense);
  };

  const handleCloseModal = () => {
    setEditingExpense(null);
  };

  const handleSaveExpense = async (updatedExpense: Omit<Expense, 'id'>) => {
    if (editingExpense) {
      await onUpdate(editingExpense.id, updatedExpense);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!expenses.length) {
    return (
      <div className="text-center py-12 bg-[#1C1F26] rounded-xl border border-gray-800">
        <Icons.Receipt className="mx-auto h-12 w-12 text-gray-600" />
        <h3 className="mt-2 text-sm font-medium text-white">No expenses</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by adding a new expense.
        </p>
      </div>
    );
  }

  const regularExpenses = expenses.filter(e => !e.isReimbursement);
  const reimbursements = expenses.filter(e => e.isReimbursement);
  const totalExpenses = regularExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalReimbursements = reimbursements.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <>
      <div className="bg-[#1C1F26] rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-[#13151A]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Split
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#1C1F26] divide-y divide-gray-800">
              {expenses.map((expense) => {
                const category = expenseCategories.find(cat => cat.id === expense.category);
                const IconComponent = (category ? Icons[category.icon as keyof typeof Icons] : Icons.Receipt) as Icons.LucideIcon;
                const isReimb = expense.isReimbursement;

                return (
                  <tr
                    key={expense.id}
                    className={`transition-colors ${isReimb ? 'hover:bg-emerald-900/10 bg-emerald-900/5' : 'hover:bg-[#232730]'}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-3 border ${isReimb ? 'bg-emerald-900/20 border-emerald-800/40' : 'bg-[#13151A] border-gray-800'}`}>
                          <IconComponent className={`h-4 w-4 ${isReimb ? 'text-emerald-400' : 'text-gray-400'}`} />
                        </div>
                        <span className="text-sm font-medium text-white">
                          {category?.name || 'Other'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        {expense.description}
                        {isReimb && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 rounded-full font-medium">
                            <RefreshCw className="h-3 w-3" />
                            Reimbursement
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-medium ${isReimb ? 'text-emerald-400' : 'text-blue-400'}`}>{expense.basimSharePercentage}%</span>
                          <span className="text-gray-600">/</span>
                          <span className={`text-xs font-medium ${isReimb ? 'text-teal-400' : 'text-purple-400'}`}>{expense.yassirSharePercentage}%</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${isReimb ? 'text-emerald-300' : 'text-white'}`}>
                          {isReimb ? '+' : ''}{expense.amount.toFixed(2)} SAR
                        </span>
                        {expense.includeTax && (
                          <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
                            +15% VAT
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick(expense)}
                          className="p-1.5 hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 rounded-lg transition-colors"
                          title="Edit expense"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(expense.id)}
                          className="p-1.5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-[#13151A] border-t border-gray-800">
              {totalReimbursements > 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-3 text-sm font-medium text-emerald-400 flex items-center gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5" />
                    Total Reimbursements
                  </td>
                  <td className="px-6 py-3 text-sm font-bold text-emerald-400">
                    +{totalReimbursements.toFixed(2)} SAR
                  </td>
                  <td></td>
                </tr>
              )}
              <tr>
                <td colSpan={3} className="px-6 py-4 text-sm font-medium text-gray-400">
                  Total Expenses
                </td>
                <td className="px-6 py-4 text-sm font-bold text-white">
                  {totalExpenses.toFixed(2)} SAR
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingExpense && (
        <ExpenseEditModal
          expense={editingExpense}
          isOpen={!!editingExpense}
          onClose={handleCloseModal}
          onSave={handleSaveExpense}
        />
      )}
    </>
  );
};