import { useState, useEffect } from 'react';
import { Plus, Edit2, Save, X, Trash2 } from 'lucide-react';
import {
    fetchShippingMappings,
    addShippingMapping,
    deleteShippingMapping
} from '../../services/sallaMappingService';
import { supabase } from '../../lib/supabase';
import type { SallaShippingMapping, ShippingMethod } from '../../types';

export default function ShippingMappingManager() {
    const [mappings, setMappings] = useState<SallaShippingMapping[]>([]);
    const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingMethodId, setEditingMethodId] = useState<string>('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        sallaShippingName: '',
        systemShippingMethodId: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            setLoading(true);
            setError(null);

            const mappingsData = await fetchShippingMappings();
            setMappings(mappingsData);

            const { data: methodsData, error: methodsError } = await supabase
                .from('shipping_methods')
                .select('*')
                .order('name');

            if (methodsError) throw methodsError;

            const formattedMethods: ShippingMethod[] = (methodsData || []).map((m: any) => ({
                id: m.id,
                name: m.name,
                cost: parseFloat(m.cost),
                is_active: m.is_active,
            }));

            setShippingMethods(formattedMethods);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data');
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleAdd() {
        if (!formData.sallaShippingName || !formData.systemShippingMethodId) {
            setError('Please fill in all fields');
            return;
        }

        try {
            setError(null);
            await addShippingMapping(formData.sallaShippingName, formData.systemShippingMethodId);
            setFormData({ sallaShippingName: '', systemShippingMethodId: '' });
            setShowAddForm(false);
            await loadData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add mapping');
        }
    }

    async function handleUpdate(id: string) {
        if (!editingMethodId) {
            setError('Please select a shipping method');
            return;
        }

        try {
            setError(null);
            const { error: updateError } = await supabase
                .from('salla_shipping_mappings')
                .update({ system_shipping_method_id: editingMethodId })
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
            await deleteShippingMapping(id);
            await loadData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete mapping');
        }
    }

    function startEdit(mapping: SallaShippingMapping) {
        setEditingId(mapping.id);
        setEditingMethodId(mapping.system_shipping_method_id);
        setShowAddForm(false);
    }

    function cancelEdit() {
        setEditingId(null);
        setEditingMethodId('');
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-gray-400">Loading shipping mappings...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white">Shipping Method Mappings</h3>
                    <p className="text-gray-400 mt-1 text-sm">
                        Map Salla shipping company names to your system shipping methods.
                    </p>
                </div>
                <button
                    onClick={() => {
                        setShowAddForm(!showAddForm);
                        setEditingId(null);
                        setFormData({ sallaShippingName: '', systemShippingMethodId: '' });
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
                    <h4 className="text-md font-semibold text-white mb-3">Add New Shipping Mapping</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Salla Shipping Name *
                            </label>
                            <input
                                type="text"
                                value={formData.sallaShippingName}
                                onChange={(e) => setFormData({ ...formData, sallaShippingName: e.target.value })}
                                placeholder="e.g., 'أرامكس'"
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                System Shipping Method *
                            </label>
                            <select
                                value={formData.systemShippingMethodId}
                                onChange={(e) => setFormData({ ...formData, systemShippingMethodId: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            >
                                <option value="">Select method...</option>
                                {shippingMethods.map((method) => (
                                    <option key={method.id} value={method.id}>
                                        {method.name} ({method.cost} SAR)
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
                                setFormData({ sallaShippingName: '', systemShippingMethodId: '' });
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
                                Salla Shipping Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                System Shipping Method
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
                                    No shipping mappings yet. Click "Add Mapping" to create one.
                                </td>
                            </tr>
                        ) : (
                            mappings.map((mapping) => {
                                const isEditing = editingId === mapping.id;
                                const systemMethod = shippingMethods.find((m) => m.id === mapping.system_shipping_method_id);

                                return (
                                    <tr key={mapping.id} className={isEditing ? 'bg-yellow-900/20' : 'hover:bg-gray-800/30'}>
                                        <td className="px-6 py-4 text-sm text-white">
                                            {mapping.salla_shipping_name}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {isEditing ? (
                                                <select
                                                    value={editingMethodId}
                                                    onChange={(e) => setEditingMethodId(e.target.value)}
                                                    className="w-full px-3 py-1 bg-gray-900 border border-gray-700 text-white rounded focus:ring-2 focus:ring-blue-500"
                                                >
                                                    {shippingMethods.map((method) => (
                                                        <option key={method.id} value={method.id}>
                                                            {method.name} ({method.cost} SAR)
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <div>
                                                    <div className="font-medium text-white">{systemMethod?.name || 'Unknown'}</div>
                                                    <div className="text-gray-500 text-xs">{systemMethod?.cost} SAR</div>
                                                </div>
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
                        Total shipping mappings: <span className="font-semibold text-white">{mappings.length}</span>
                    </p>
                </div>
            )}
        </div>
    );
}
