import React, { useState, useEffect } from 'react';
import { Expense } from '../../types/expense';
import { expenseCategories } from '../../data/expenseCategories';
import { X, Save } from 'lucide-react';

interface ExpenseEditModalProps {
    expense: Expense;
    isOpen: boolean;
    onClose: () => void;
    onSave: (expense: Omit<Expense, 'id'>) => Promise<void>;
}

export const ExpenseEditModal: React.FC<ExpenseEditModalProps> = ({
    expense,
    isOpen,
    onClose,
    onSave
}) => {
    const [category, setCategory] = useState<Expense['category']>(expense.category);
    const [description, setDescription] = useState(expense.description);
    const [amount, setAmount] = useState(expense.amountBeforeTax?.toString() || expense.amount.toString());
    const [date, setDate] = useState(expense.date);
    const [basimShare, setBasimShare] = useState(expense.basimSharePercentage);
    const [yassirShare, setYassirShare] = useState(expense.yassirSharePercentage);
    const [includeTax, setIncludeTax] = useState(expense.includeTax);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when expense changes
    useEffect(() => {
        setCategory(expense.category);
        setDescription(expense.description);
        setAmount(expense.amountBeforeTax?.toString() || expense.amount.toString());
        setDate(expense.date);
        setBasimShare(expense.basimSharePercentage);
        setYassirShare(expense.yassirSharePercentage);
        setIncludeTax(expense.includeTax);
    }, [expense]);

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
            alert('Please fill in all required fields');
            return;
        }

        try {
            setIsSubmitting(true);

            // Auto-determine owner based on split percentages
            const owner: Expense['owner'] =
                basimShare === yassirShare ? 'shared' :
                    basimShare > yassirShare ? 'basim' : 'yassir';

            // Calculate total amount (base + tax if applicable)
            const totalAmount = includeTax
                ? parseFloat(amount) * 1.15  // Add 15% tax to base amount
                : parseFloat(amount);         // No tax, use base amount

            await onSave({
                category,
                description,
                amount: totalAmount,
                owner,
                basimSharePercentage: basimShare,
                yassirSharePercentage: yassirShare,
                includeTax,
                amountBeforeTax: includeTax ? parseFloat(amount) : undefined,
                date
            });

            onClose();
        } catch (error) {
            console.error('Error updating expense:', error);
            alert('Failed to update expense. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1C1F26] rounded-xl border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    {/* Header */}
                    <div className="sticky top-0 bg-[#1C1F26] border-b border-gray-800 px-6 py-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-white">Edit Expense</h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <X className="h-5 w-5 text-gray-400" />
                        </button>
                    </div>

                    {/* Form Content */}
                    <div className="p-6 space-y-6">
                        {/* Category */}
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

                        {/* Description */}
                        <div>
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

                        {/* Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Date
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-4 py-3 bg-[#13151A] border border-gray-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            />
                        </div>

                        {/* Amount */}
                        <div>
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

                        {/* Owner Split Percentage */}
                        <div className="bg-gray-800/30 rounded-lg p-5 border border-gray-700/50">
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

                        {/* Tax Toggle */}
                        <div className="bg-blue-900/10 border border-blue-700/30 rounded-lg p-5">
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

                    {/* Footer */}
                    <div className="sticky bottom-0 bg-[#1C1F26] border-t border-gray-800 px-6 py-4 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-6 py-2.5 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-700 transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-500 transition-all disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
