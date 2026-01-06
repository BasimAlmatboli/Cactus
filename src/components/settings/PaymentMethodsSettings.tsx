import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Power, Loader2, AlertCircle, Check } from 'lucide-react';
import {
    fetchPaymentMethods,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    togglePaymentMethodStatus
} from '../../services/paymentMethodService';
import type { PaymentMethod } from '../../types';

interface PaymentMethodForm {
    name: string;
    fee_percentage: number;
    fee_fixed: number;
    tax_rate: number;
    customer_fee: number;
}

export const PaymentMethodsSettings = () => {
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
    const [formData, setFormData] = useState<PaymentMethodForm>({
        name: '',
        fee_percentage: 0,
        fee_fixed: 0,
        tax_rate: 15,
        customer_fee: 0
    });

    useEffect(() => {
        loadMethods();
    }, []);

    const loadMethods = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchPaymentMethods(false); // Get all methods
            setMethods(data);
        } catch (err) {
            console.error('Failed to load payment methods:', err);
            setError('Failed to load payment methods');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (method?: PaymentMethod) => {
        if (method) {
            setEditingMethod(method);
            setFormData({
                name: method.name,
                fee_percentage: method.fee_percentage,
                fee_fixed: method.fee_fixed,
                tax_rate: method.tax_rate,
                customer_fee: method.customer_fee
            });
        } else {
            setEditingMethod(null);
            setFormData({
                name: '',
                fee_percentage: 0,
                fee_fixed: 0,
                tax_rate: 15,
                customer_fee: 0
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingMethod(null);
        setFormData({
            name: '',
            fee_percentage: 0,
            fee_fixed: 0,
            tax_rate: 15,
            customer_fee: 0
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            if (editingMethod) {
                await updatePaymentMethod(editingMethod.id, formData);
                setSuccess('Payment method updated successfully');
            } else {
                await createPaymentMethod({
                    ...formData,
                    display_order: methods.length + 1
                });
                setSuccess('Payment method created successfully');
            }
            await loadMethods();
            handleCloseModal();
        } catch (err) {
            console.error('Failed to save payment method:', err);
            setError(err instanceof Error ? err.message : 'Failed to save payment method');
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            setError(null);
            setSuccess(null);
            await deletePaymentMethod(id);
            setSuccess('Payment method deleted successfully');
            await loadMethods();
        } catch (err) {
            console.error('Failed to delete payment method:', err);
            setError('Failed to delete payment method');
        }
    };

    const handleToggleStatus = async (id: string) => {
        try {
            setError(null);
            setSuccess(null);
            await togglePaymentMethodStatus(id);
            setSuccess('Status updated successfully');
            await loadMethods();
        } catch (err) {
            console.error('Failed to toggle status:', err);
            setError('Failed to update status');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Add Button */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-white">Payment Methods</h3>
                    <p className="text-sm text-gray-400 mt-1">
                        Manage payment methods and their fee configurations
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Add Method
                </button>
            </div>

            {/* Success Message */}
            {success && (
                <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4 flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-green-300">{success}</p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-300">{error}</p>
                </div>
            )}

            {/* Payment Methods Table */}
            <div className="border border-gray-700 rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-800/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Method</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Gateway Fee %</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Gateway Fixed</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Customer Fee</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Tax %</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {methods.map((method) => (
                            <tr key={method.id} className="hover:bg-gray-800/30">
                                <td className="px-6 py-4 text-white font-medium">{method.name}</td>
                                <td className="px-6 py-4 text-gray-300">{method.fee_percentage}%</td>
                                <td className="px-6 py-4 text-gray-300">{method.fee_fixed} SAR</td>
                                <td className="px-6 py-4">
                                    <span className={`font-medium ${method.customer_fee > 0 ? 'text-green-400' : 'text-gray-500'}`}>
                                        {method.customer_fee > 0 ? `${method.customer_fee} SAR` : '-'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-300">{method.tax_rate}%</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${method.is_active
                                        ? 'bg-green-900/30 text-green-400'
                                        : 'bg-gray-700/50 text-gray-400'
                                        }`}>
                                        {method.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleToggleStatus(method.id)}
                                            className={`p-2 rounded-lg transition-colors ${method.is_active
                                                ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                                                : 'text-green-400 hover:text-green-300 hover:bg-green-900/20'
                                                }`}
                                            title={method.is_active ? 'Deactivate' : 'Activate'}
                                        >
                                            <Power className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleOpenModal(method)}
                                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(method.id, method.name)}
                                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1C1F26] rounded-xl border border-gray-700 w-full max-w-md">
                        <div className="p-6 border-b border-gray-700">
                            <h3 className="text-xl font-semibold text-white">
                                {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Method Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-[#0F1115] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., Apple Pay"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Fee Percentage (%)
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.fee_percentage}
                                    onChange={(e) => setFormData({ ...formData, fee_percentage: parseFloat(e.target.value) })}
                                    className="w-full px-4 py-2 bg-[#0F1115] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Fixed Fee (SAR)
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.fee_fixed}
                                    onChange={(e) => setFormData({ ...formData, fee_fixed: parseFloat(e.target.value) })}
                                    className="w-full px-4 py-2 bg-[#0F1115] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Tax Rate (%)
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.tax_rate}
                                    onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) })}
                                    className="w-full px-4 py-2 bg-[#0F1115] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Customer Fee (SAR)
                                    <span className="text-xs text-gray-500 ml-2">(e.g., COD fee charged to customer)</span>
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.customer_fee}
                                    onChange={(e) => setFormData({ ...formData, customer_fee: parseFloat(e.target.value) })}
                                    className="w-full px-4 py-2 bg-[#0F1115] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="10.00"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    {editingMethod ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
