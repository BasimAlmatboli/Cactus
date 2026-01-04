import React, { useState } from 'react';
import { Expense } from '../../types/expense';
import { expenseCategories } from '../../data/expenseCategories';
import { Trash2, Loader2, Pencil, Check, X } from 'lucide-react';
import * as Icons from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<void>;
  onUpdateAmount: (id: string, amount: number) => Promise<void>;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  isLoading,
  onDelete,
  onUpdateAmount
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const handleEditClick = (expense: Expense) => {
    setEditingId(expense.id);
    setEditAmount(expense.amount.toString());
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditAmount('');
  };

  const handleSaveEdit = async (id: string) => {
    const amount = parseFloat(editAmount);

    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }

    try {
      setIsSaving(true);
      await onUpdateAmount(id, amount);
      setEditingId(null);
      setEditAmount('');
    } catch (error) {
      console.error('Error updating expense amount:', error);
      alert('Failed to update expense amount. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(id);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
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

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
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
                Owner
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

              return (
                <tr key={expense.id} className="hover:bg-[#232730] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="p-2 bg-[#13151A] rounded-lg mr-3 border border-gray-800">
                        <IconComponent className="h-4 w-4 text-gray-400" />
                      </div>
                      <span className="text-sm font-medium text-white">
                        {category?.name || 'Other'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {expense.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${expense.owner === 'basim' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      expense.owner === 'yassir' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        'bg-gray-500/10 text-gray-400 border-gray-500/20'
                      }`}>
                      {expense.owner === 'basim' ? 'Basim' : expense.owner === 'yassir' ? 'Yassir' : 'Shared'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                    {editingId === expense.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, expense.id)}
                          className="w-32 px-3 py-1.5 bg-[#13151A] border border-blue-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          disabled={isSaving}
                          autoFocus
                        />
                        <span className="text-gray-500">SAR</span>
                      </div>
                    ) : (
                      `${expense.amount.toFixed(2)} SAR`
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {editingId === expense.id ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(expense.id)}
                            disabled={isSaving}
                            className="p-1.5 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors disabled:opacity-50"
                            title="Save"
                          >
                            {isSaving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={isSaving}
                            className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditClick(expense)}
                            className="p-1.5 hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 rounded-lg transition-colors"
                            title="Edit amount"
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
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-[#13151A] border-t border-gray-800">
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
  );
};