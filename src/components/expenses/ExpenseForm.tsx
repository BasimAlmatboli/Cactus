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
  const [basimShare, setBasimShare] = useState(50);
  const [yassirShare, setYassirShare] = useState(50);
  const [includeTax, setIncludeTax] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-calculate complementary percentage
  const handleBasimShareChange = (value: number) => {
    const validValue = Math.max(0, Math.min(100, value));
    setBasimShare(validValue);
    setYassirShare(100 - validValue);
  };

  const handleYassirShareChange = (value: number) => {
    const validValue = Math.max(0, Math.min(100, value));
    setYassirShare(validValue);
    setBasimShare(100 - validValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description || !amount) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      // Auto-determine owner based on split percentages for backward compatibility
      const owner: Expense['owner'] =
        basimShare === yassirShare ? 'shared' :
          basimShare > yassirShare ? 'basim' : 'yassir';

      // Calculate total amount (base + tax if applicable)
      const totalAmount = includeTax
        ? parseFloat(amount) * 1.15  // Add 15% tax to base amount
        : parseFloat(amount);         // No tax, use base amount

      await saveExpense({
        category,
        description,
        amount: totalAmount,  // Store total (with tax if applicable)
        owner,
        basimSharePercentage: basimShare,
        yassirSharePercentage: yassirShare,
        includeTax,
        amountBeforeTax: includeTax ? parseFloat(amount) : undefined,  // Store base if tax applied
        date
      });

      // Reset form
      setCategory('other');
      setDescription('');
      setAmount('');
      setBasimShare(50);
      setYassirShare(50);
      setIncludeTax(false);
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
        <div className="md:col-span-2">
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

        {/* Owner Split Percentage Section */}
        <div className="md:col-span-2 bg-gray-800/30 rounded-lg p-5 border border-gray-700/50">
          <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
            Owner Split Percentage
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Basim Share */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                Basim Share (%)
              </label>
              <input
                type="number"
                value={basimShare}
                onChange={(e) => handleBasimShareChange(Number(e.target.value))}
                min="0"
                max="100"
                step="1"
                className="w-full px-4 py-2.5 bg-[#13151A] border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
              />
            </div>

            {/* Yasir Share */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                Yasir Share (%)
              </label>
              <input
                type="number"
                value={yassirShare}
                onChange={(e) => handleYassirShareChange(Number(e.target.value))}
                min="0"
                max="100"
                step="1"
                className="w-full px-4 py-2.5 bg-[#13151A] border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
              />
            </div>
          </div>

          {/* Visual Split Indicator */}
          <div>
            <div className="h-3 bg-gray-700/50 rounded-full overflow-hidden flex">
              <div
                className="bg-blue-500 transition-all duration-300"
                style={{ width: `${basimShare}%` }}
              />
              <div
                className="bg-purple-500 transition-all duration-300"
                style={{ width: `${yassirShare}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs">
              <span className="text-blue-400 font-medium">Basim: {basimShare}%</span>
              <span className="text-purple-400 font-medium">Yasir: {yassirShare}%</span>
            </div>
          </div>
        </div>

        {/* Tax Toggle Section */}
        <div className="md:col-span-2 bg-blue-900/10 border border-blue-700/30 rounded-lg p-5">
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-300 mb-1 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                Add 15% VAT
              </h3>
              <p className="text-xs text-gray-400">
                Check to add 15% tax to the amount (e.g., Meta Ads, TikTok Ads)
              </p>
            </div>
            <input
              type="checkbox"
              checked={includeTax}
              onChange={(e) => setIncludeTax(e.target.checked)}
              className="w-6 h-6 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 transition-all"
            />
          </label>

          {includeTax && amount && parseFloat(amount) > 0 && (
            <div className="mt-4 pt-4 border-t border-blue-700/30 space-y-2 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Base amount:</span>
                <span className="font-mono">{parseFloat(amount).toFixed(2)} SAR</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Tax (15%):</span>
                <span className="font-mono text-blue-400">+{(parseFloat(amount) * 0.15).toFixed(2)} SAR</span>
              </div>
              <div className="flex justify-between text-white font-semibold text-base pt-2 border-t border-blue-700/30">
                <span>Total to save:</span>
                <span className="font-mono text-green-400">{(parseFloat(amount) * 1.15).toFixed(2)} SAR</span>
              </div>
            </div>
          )}
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
    </form >
  );
};