import { useState, useEffect } from 'react';
import { Plus, Edit2, Save, X, Trash2 } from 'lucide-react';
import {
    fetchPaymentMappings,
    addPaymentMapping,
    deletePaymentMapping
} from '../../services/sallaMappingService';
import { fetchPaymentMethods } from '../../services/paymentMethodService';
import { supabase } from '../../lib/supabase';
import type { SallaPaymentMapping, PaymentMethod } from '../../types';

export default function PaymentMappingManager() {
    const [mappings, setMappings] = useState<SallaPaymentMapping[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingMethodId, setEditingMethodId] = useState<string>('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        sallaPaymentName: '',
        systemPaymentMethodId: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            setLoading(true);
            setError(null);

            const [mappingsData, methodsData] = await Promise.all([
                fetchPaymentMappings(),
                fetchPaymentMethods(true) // Only fetch active methods
            ]);

            setMappings(mappingsData);
            setPaymentMethods(methodsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data');
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleAdd() {
        if (!formData.sallaPaymentName || !formData.systemPaymentMethodId) {
            setError('Please fill in all fields');
            return;
        }

        try {
            setError(null);
            await addPaymentMapping(formData.sallaPaymentName, formData.systemPaymentMethodId);
            setFormData({ sallaPaymentName: '', systemPaymentMethodId: '' });
            setShowAddForm(false);
            await loadData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add mapping');
        }
    }

    async function handleUpdate(id: string) {
        if (!editingMethodId) {
            setError('Please select a payment method');
            return;
        }

        try {
            setError(null);
            const { error: updateError } = await supabase
                .from('salla_payment_mappings')
                .update({ system_payment_method_id: editingMethodId })
                .eq('id', id);

            if (updateError) throw updateError;

            setEditingId(null);
            setEditingMethodId('');
            await loadData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update mapping');
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this mapping?')) return;

        try {
            setError(null);
            await deletePaymentMapping(id);
            await loadData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete mapping');
        }
    }

    function startEdit(mapping: SallaPaymentMapping) {
        setEditingId(mapping.id);
        setEditingMethodId(mapping.system_payment_method_id);
        setShowAddForm(false);
    }

    function cancelEdit() {
        setEditingId(null);
        setEditingMethodId('');
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-gray-400">Loading payment mappings...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white">Payment Method Mappings</h3>
                    <p className="text-gray-400 mt-1 text-sm">
                        Map Salla payment method names to your system payment methods.
                    </p>
                </div>
                <button
                    onClick={() => {
                        setShowAddForm(!showAddForm);
                        setEditingId(null);
                        setFormData({ sallaPaymentName: '', systemPaymentMethodId: '' });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add Mapping
                </button>
            </div>

            {error && (
                <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                    <p className="text-red-300 text-sm">{error}</p>
                </div>
            )}

            {showAddForm && (
                <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                    <h4 className="text-md font-semibold text-white mb-3">Add New Payment Mapping</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Salla Payment Name *
                            </label>
                            <input
                                type="text"
                                value={formData.sallaPaymentName}
                                onChange={(e) => setFormData({ ...formData, sallaPaymentName: e.target.value })}
                                placeholder="e.g., أبل باي"
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                System Payment Method *
                            </label>
                            <select
                                value={formData.systemPaymentMethodId}
                                onChange={(e) => setFormData({ ...formData, systemPaymentMethodId: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            >
                                <option value="">Select method...</option>
                                {paymentMethods.map((method) => (
                                    <option key={method.id} value={method.id}>
                                        {method.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleAdd}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                            <Save className="w-4 h-4" />
                            Save Mapping
                        </button>
                        <button
                            onClick={() => {
                                setShowAddForm(false);
                                setFormData({ sallaPaymentName: '', systemPaymentMethodId: '' });
                            }}
                            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-800/50 border-b border-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Salla Payment Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                System Payment Method
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/50">
                        {mappings.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                    No payment mappings yet. Click "Add Mapping" to create one.
                                </td>
                            </tr>
                        ) : (
                            mappings.map((mapping) => {
                                const isEditing = editingId === mapping.id;
                                const systemMethod = paymentMethods.find((m) => m.id === mapping.system_payment_method_id);

                                return (
                                    <tr key={mapping.id} className={isEditing ? 'bg-yellow-900/20' : 'hover:bg-gray-800/30'}>
                                        <td className="px-6 py-4 text-sm text-white">
                                            {mapping.salla_payment_name}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {isEditing ? (
                                                <select
                                                    value={editingMethodId}
                                                    onChange={(e) => setEditingMethodId(e.target.value)}
                                                    className="w-full px-3 py-1 bg-gray-900 border border-gray-700 text-white rounded focus:ring-2 focus:ring-blue-500"
                                                >
                                                    {paymentMethods.map((method) => (
                                                        <option key={method.id} value={method.id}>
                                                            {method.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <div className="font-medium text-white">{systemMethod?.name || 'Unknown'}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right">
                                            {isEditing ? (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleUpdate(mapping.id)}
                                                        className="p-2 text-green-400 hover:bg-green-900/20 rounded transition-colors"
                                                        title="Save"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={cancelEdit}
                                                        className="p-2 text-gray-400 hover:bg-gray-800/50 rounded transition-colors"
                                                        title="Cancel"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => startEdit(mapping)}
                                                        className="p-2 text-blue-400 hover:bg-blue-900/20 rounded transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(mapping.id)}
                                                        className="p-2 text-red-400 hover:bg-red-900/20 rounded transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {mappings.length > 0 && (
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                    <p className="text-sm text-gray-400">
                        Total payment mappings: <span className="font-semibold text-white">{mappings.length}</span>
                    </p>
                </div>
            )}
        </div>
    );
}
