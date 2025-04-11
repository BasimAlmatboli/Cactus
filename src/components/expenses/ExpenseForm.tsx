import React, { useState } from 'react';
import { Expense } from '../../types/expense';
import { expenseCategories } from '../../data/expenseCategories';
import { saveExpense } from '../../services/expenseService';
import { Plus } from 'lucide-react';

export const ExpenseForm: React.FC<{ onExpenseAdded: () => void }> = ({ onExpenseAdded }) => {
  const [category, setCategory] = useState<Expense['category']>('other');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description || !amount || !date) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      await saveExpense({
        category,
        description,
        amount: parseFloat(amount),
        date
      });
      
      // Reset form
      setCategory('other');
      setDescription('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      
      onExpenseAdded();
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Failed to save expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">Add New Expense</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Expense['category'])}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            {expenseCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter expense description"
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (SAR)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg transition-colors ${
          isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:bg-blue-700'
        }`}
      >
        <Plus className="h-4 w-4" />
        <span>{isSubmitting ? 'Adding...' : 'Add Expense'}</span>
      </button>
    </form>
  );
};