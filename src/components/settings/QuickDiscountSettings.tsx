import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronUp, ChevronDown, Tag, Loader2, Save, X, Eye } from 'lucide-react';
import { QuickDiscount } from '../../types';
import {
    getQuickDiscounts,
    createQuickDiscount,
    updateQuickDiscount,
    deleteQuickDiscount,
    reorderQuickDiscounts,
} from '../../services/quickDiscountService';

export const QuickDiscountSettings: React.FC = () => {
    const [discounts, setDiscounts] = useState<QuickDiscount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        type: 'percentage' as 'percentage' | 'fixed',
        value: '',
    });

    // Load discounts on mount
    useEffect(() => {
        loadDiscounts();
    }, []);

    const loadDiscounts = async () => {
        try {
            setIsLoading(true);
            const data = await getQuickDiscounts(false); // Get all discounts
            setDiscounts(data);
        } catch (error) {
            console.error('Failed to load quick discounts:', error);
            alert('Failed to load quick discounts. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdd = () => {
        setIsAdding(true);
        setFormData({ name: '', type: 'percentage', value: '' });
    };

    const handleCancelAdd = () => {
        setIsAdding(false);
        setFormData({ name: '', type: 'percentage', value: '' });
    };

    const handleSaveNew = async () => {
        if (!formData.name.trim()) {
            alert('Please enter a discount name');
            return;
        }

        const value = parseFloat(formData.value);
        if (isNaN(value) || value < 0) {
            alert('Please enter a valid discount value');
            return;
        }

        if (formData.type === 'percentage' && value > 100) {
            alert('Percentage discount cannot exceed 100%');
            return;
        }

        try {
            const maxOrder = Math.max(0, ...discounts.map(d => d.displayOrder));
            await createQuickDiscount({
                name: formData.name.trim(),
                type: formData.type,
                value,
                displayOrder: maxOrder + 1,
                isActive: true,
            });
            await loadDiscounts();
            setIsAdding(false);
            setFormData({ name: '', type: 'percentage', value: '' });
        } catch (error) {
            console.error('Failed to create discount:', error);
            alert('Failed to create discount. Please try again.');
        }
    };

    const handleEdit = (discount: QuickDiscount) => {
        setEditingId(discount.id);
        setFormData({
            name: discount.name,
            type: discount.type,
            value: discount.value.toString(),
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({ name: '', type: 'percentage', value: '' });
    };

    const handleSaveEdit = async (id: string) => {
        if (!formData.name.trim()) {
            alert('Please enter a discount name');
            return;
        }

        const value = parseFloat(formData.value);
        if (isNaN(value) || value < 0) {
            alert('Please enter a valid discount value');
            return;
        }

        if (formData.type === 'percentage' && value > 100) {
            alert('Percentage discount cannot exceed 100%');
            return;
        }

        try {
            await updateQuickDiscount(id, {
                name: formData.name.trim(),
                type: formData.type,
                value,
            });
            await loadDiscounts();
            setEditingId(null);
            setFormData({ name: '', type: 'percentage', value: '' });
        } catch (error) {
            console.error('Failed to update discount:', error);
            alert('Failed to update discount. Please try again.');
        }
    };

    const handleToggleActive = async (discount: QuickDiscount) => {
        try {
            await updateQuickDiscount(discount.id, {
                isActive: !discount.isActive,
            });
            await loadDiscounts();
        } catch (error) {
            console.error('Failed to toggle discount:', error);
            alert('Failed to toggle discount. Please try again.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!deletingId) {
            setDeletingId(id);
            return;
        }

        try {
            await deleteQuickDiscount(id);
            await loadDiscounts();
            setDeletingId(null);
        } catch (error) {
            console.error('Failed to delete discount:', error);
            alert('Failed to delete discount. Please try again.');
        }
    };

    const handleMoveUp = async (discount: QuickDiscount, index: number) => {
        if (index === 0) return;

        const newDiscounts = [...discounts];
        const prev = newDiscounts[index - 1];
        newDiscounts[index - 1] = discount;
        newDiscounts[index] = prev;

        setDiscounts(newDiscounts);

        try {
            await reorderQuickDiscounts([
                { id: discount.id, displayOrder: prev.displayOrder },
                { id: prev.id, displayOrder: discount.displayOrder },
            ]);
            await loadDiscounts();
        } catch (error) {
            console.error('Failed to reorder discounts:', error);
            alert('Failed to reorder discounts. Please try again.');
            await loadDiscounts();
        }
    };

    const handleMoveDown = async (discount: QuickDiscount, index: number) => {
        if (index === discounts.length - 1) return;

        const newDiscounts = [...discounts];
        const next = newDiscounts[index + 1];
        newDiscounts[index + 1] = discount;
        newDiscounts[index] = next;

        setDiscounts(newDiscounts);

        try {
            await reorderQuickDiscounts([
                { id: discount.id, displayOrder: next.displayOrder },
                { id: next.id, displayOrder: discount.displayOrder },
            ]);
            await loadDiscounts();
        } catch (error) {
            console.error('Failed to reorder discounts:', error);
            alert('Failed to reorder discounts. Please try again.');
            await loadDiscounts();
        }
    };

    const renderDiscountPreview = (type: 'percentage' | 'fixed', value: number) => {
        return (
            <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg text-sm font-medium">
                {type === 'percentage' ? `${value}%` : `${value} SAR`}
            </span>
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <p className="text-gray-400 text-sm">
                    Manage quick apply discount buttons shown in the Calculator page.
                </p>
                <button
                    onClick={handleAdd}
                    disabled={isAdding}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus className="h-4 w-4" />
                    Add Discount
                </button>
            </div>

            {/* Add New Discount Form */}
            {isAdding && (
                <div className="bg-[#13151A] border border-blue-500/30 rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-2 text-blue-400 font-medium">
                        <Tag className="h-5 w-5" />
                        <span>New Quick Discount</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Discount Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Student Discount"
                                className="w-full p-3 bg-[#1C1F26] border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Type *</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'percentage' | 'fixed' })}
                                className="w-full p-3 bg-[#1C1F26] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount (SAR)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Value *</label>
                            <input
                                type="number"
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                placeholder={formData.type === 'percentage' ? '10' : '50'}
                                min="0"
                                step={formData.type === 'percentage' ? '1' : '0.01'}
                                className="w-full p-3 bg-[#1C1F26] border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            onClick={handleSaveNew}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                        >
                            <Save className="h-4 w-4" />
                            Save Discount
                        </button>
                        <button
                            onClick={handleCancelAdd}
                            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Discounts List */}
            {discounts.length === 0 ? (
                <div className="text-center py-12 bg-[#13151A] rounded-xl border border-gray-800">
                    <Tag className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No quick discounts configured yet.</p>
                    <p className="text-gray-500 text-sm mt-1">Click "Add Discount" to create your first one.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {discounts.map((discount, index) => (
                        <div
                            key={discount.id}
                            className={`bg-[#13151A] rounded-xl border ${discount.isActive ? 'border-gray-800' : 'border-gray-800/50 opacity-60'
                                } overflow-hidden transition-all`}
                        >
                            {editingId === discount.id ? (
                                // Edit Mode
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Discount Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full p-3 bg-[#1C1F26] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Type *</label>
                                            <select
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'percentage' | 'fixed' })}
                                                className="w-full p-3 bg-[#1C1F26] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                            >
                                                <option value="percentage">Percentage (%)</option>
                                                <option value="fixed">Fixed Amount (SAR)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Value *</label>
                                            <input
                                                type="number"
                                                value={formData.value}
                                                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                                min="0"
                                                step={formData.type === 'percentage' ? '1' : '0.01'}
                                                className="w-full p-3 bg-[#1C1F26] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleSaveEdit(discount.id)}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                                        >
                                            <Save className="h-4 w-4" />
                                            Save
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // View Mode
                                <div className="p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        {/* Reorder Buttons */}
                                        <div className="flex flex-col gap-1">
                                            <button
                                                onClick={() => handleMoveUp(discount, index)}
                                                disabled={index === 0}
                                                className="p-1 text-gray-500 hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                title="Move up"
                                            >
                                                <ChevronUp className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleMoveDown(discount, index)}
                                                disabled={index === discounts.length - 1}
                                                className="p-1 text-gray-500 hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                title="Move down"
                                            >
                                                <ChevronDown className="h-4 w-4" />
                                            </button>
                                        </div>

                                        {/* Discount Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-white font-medium">{discount.name}</h3>
                                                {renderDiscountPreview(discount.type, discount.value)}
                                            </div>
                                            <p className="text-gray-500 text-sm">
                                                {discount.isActive ? 'Active' : 'Inactive'} • Order: {discount.displayOrder}
                                            </p>
                                        </div>

                                        {/* Preview */}
                                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                                            <Eye className="h-4 w-4" />
                                            <span>Preview:</span>
                                            <div className="px-3 py-1.5 bg-[#232730] border border-gray-700 text-blue-400 rounded-lg text-sm font-medium">
                                                {discount.type === 'percentage' ? `${discount.value}%` : `${discount.value} SAR`}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 ml-4">
                                        {/* Toggle Active */}
                                        <button
                                            onClick={() => handleToggleActive(discount)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${discount.isActive
                                                    ? 'bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20'
                                                    : 'bg-gray-700 text-gray-400 border border-gray-600 hover:bg-gray-600'
                                                }`}
                                        >
                                            {discount.isActive ? 'Active' : 'Inactive'}
                                        </button>

                                        {/* Edit */}
                                        <button
                                            onClick={() => handleEdit(discount)}
                                            className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                            title="Edit discount"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>

                                        {/* Delete */}
                                        {deletingId === discount.id ? (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleDelete(discount.id)}
                                                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-500 transition-colors"
                                                >
                                                    Confirm
                                                </button>
                                                <button
                                                    onClick={() => setDeletingId(null)}
                                                    className="p-2 text-gray-400 hover:text-white transition-colors"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleDelete(discount.id)}
                                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Delete discount"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
