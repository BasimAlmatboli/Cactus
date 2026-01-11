import { useState, useEffect } from 'react';
import { Expense } from '../types/expense';
import { getExpenses, deleteExpense, updateExpense } from '../services/expenseService';
import { ExpenseForm } from '../components/expenses/ExpenseForm';
import { ExpenseList } from '../components/expenses/ExpenseList';
import { ExpenseImportExport } from '../components/expenses/ExpenseImportExport';
import { ExpensesSummaryReport } from '../components/expenses/ExpensesSummaryReport';

export const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadExpenses = async () => {
    try {
      setIsLoading(true);
      const data = await getExpenses();
      setExpenses(data);
    } catch (error) {
      console.error('Error loading expenses:', error);
      alert('Failed to load expenses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id);
        await loadExpenses();
      } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Failed to delete expense. Please try again.');
      }
    }
  };

  const handleUpdate = async (id: string, expense: Omit<Expense, 'id'>) => {
    try {
      await updateExpense(id, expense);
      await loadExpenses();
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  };

  return (
    <div className="pt-2 pb-32">
      <div className="max-w-[1600px] px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Expenses</h1>
          <ExpenseImportExport
            expenses={expenses}
            onExpensesImported={loadExpenses}
          />
        </div>

        <div className="space-y-6">
          <ExpenseForm onExpenseAdded={loadExpenses} />
          {expenses.length > 0 && (
            <ExpensesSummaryReport expenses={expenses} />
          )}
          <ExpenseList
            expenses={expenses}
            isLoading={isLoading}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        </div>
      </div>
    </div>
  );
};