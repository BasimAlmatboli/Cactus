import React, { useState } from 'react';
import { Expense } from '../../types/expense';
import { expenseCategories } from '../../data/expenseCategories';
import { saveExpense } from '../../services/expenseService';
import { Plus } from 'lucide-react';

export const ExpenseForm: React.FC<{ onExpenseAdded: () => void }> = ({ onExpenseAdded }) => {
  const [category, setCategory] = useState<Expense['category']>('other');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [owner, setOwner] = useState<Expense['owner']>('shared');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description || !amount) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      await saveExpense({
        category,
        description,
        amount: parseFloat(amount),
        owner,
        date
      });

      // Reset form
      setCategory('other');
      setDescription('');
      setAmount('');
      setOwner('shared');
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
    <form onSubmit={handleSubmit} className="bg-[#1C1F26] rounded-xl border border-gray-800 p-6">
      <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <Plus className="h-6 w-6 text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">Add New Expense</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Expense['category'])}
            className="w-full px-4 py-3 bg-[#13151A] border border-gray-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          >
            {expenseCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Owner
          </label>
          <select
            value={owner}
            onChange={(e) => setOwner(e.target.value as Expense['owner'])}
            className="w-full px-4 py-3 bg-[#13151A] border border-gray-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          >
            <option value="basim">Basim</option>
            <option value="yassir">Yassir</option>
            <option value="shared">Shared</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter expense description"
            className="w-full px-4 py-3 bg-[#13151A] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Amount (SAR)
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full px-4 py-3 bg-[#13151A] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <span className="text-gray-500">SAR</span>
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`mt-8 w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-900/20 ${isSubmitting
            ? 'opacity-75 cursor-not-allowed'
            : 'hover:bg-blue-500 hover:shadow-blue-600/30 hover:-translate-y-0.5'
          }`}
      >
        <Plus className="h-5 w-5" />
        <span>{isSubmitting ? 'Adding Expense...' : 'Add Expense'}</span>
      </button>
    </form>
  );
};