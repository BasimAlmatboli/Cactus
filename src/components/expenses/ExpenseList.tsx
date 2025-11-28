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
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!expenses.length) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-md">
        <Icons.Receipt className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No expenses</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by adding a new expense.
        </p>
      </div>
    );
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Owner
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {expenses.map((expense) => {
              const category = expenseCategories.find(cat => cat.id === expense.category);
              const IconComponent = category ? Icons[category.icon as keyof typeof Icons] : Icons.Receipt;

              return (
                <tr key={expense.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <IconComponent className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {category?.name || 'Other'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {expense.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                      expense.owner === 'basim' ? 'bg-blue-100 text-blue-800' :
                      expense.owner === 'yassir' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {expense.owner === 'basim' ? 'Basim' : expense.owner === 'yassir' ? 'Yassir' : 'Shared'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {editingId === expense.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, expense.id)}
                          className="w-32 px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="text-green-600 hover:text-green-900 transition-colors disabled:opacity-50"
                            title="Save"
                          >
                            {isSaving ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <Check className="h-5 w-5" />
                            )}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={isSaving}
                            className="text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
                            title="Cancel"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditClick(expense)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Edit amount"
                          >
                            <Pencil className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => onDelete(expense.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={3} className="px-6 py-4 text-sm font-medium text-gray-900">
                Total Expenses
              </td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
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