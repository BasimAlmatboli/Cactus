import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import {
    fetchProductMappings,
    addProductMapping,
    deleteProductMapping,
    updateProductMapping
} from '../../services/sallaMappingService';
import { supabase } from '../../lib/supabase';
import type { SallaProductMapping, Product } from '../../types';

export default function ProductMappingManager() {
    const [mappings, setMappings] = useState<SallaProductMapping[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        sallaProductName: '',
        sallaSku: '',
        systemProductId: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            setLoading(true);
            setError(null);

            const mappingsData = await fetchProductMappings();
            setMappings(mappingsData);

            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select('*')
                .order('name');

            if (productsError) throw productsError;

            const formattedProducts: Product[] = (productsData || []).map((p: any) => ({
                id: p.id,
                name: p.name,
                sku: p.sku,
                cost: parseFloat(p.cost),
                sellingPrice: parseFloat(p.selling_price),
                owner: p.owner,
            }));

            setProducts(formattedProducts);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data');
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleAdd() {
        if (!formData.sallaProductName || !formData.systemProductId) {
            setError('Please fill in required fields');
            return;
        }

        try {
            setError(null);
            await addProductMapping(
                formData.sallaProductName,
                formData.sallaSku || null,
                formData.systemProductId
            );

            setFormData({ sallaProductName: '', sallaSku: '', systemProductId: '' });
            setShowAddForm(false);
            await loadData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add mapping');
        }
    }

    async function handleUpdate(id: string) {
        if (!formData.systemProductId) {
            setError('Please select a system product');
            return;
        }

        try {
            setError(null);
            await updateProductMapping(id, formData.systemProductId);
            setEditingId(null);
            setFormData({ sallaProductName: '', sallaSku: '', systemProductId: '' });
            await loadData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update mapping');
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this mapping?')) return;

        try {
            setError(null);
            await deleteProductMapping(id);
            await loadData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete mapping');
        }
    }

    function startEdit(mapping: SallaProductMapping) {
        setEditingId(mapping.id);
        setFormData({
            sallaProductName: mapping.salla_product_name,
            sallaSku: mapping.salla_sku || '',
            systemProductId: mapping.system_product_id,
        });
        setShowAddForm(false);
    }

    function cancelEdit() {
        setEditingId(null);
        setFormData({ sallaProductName: '', sallaSku: '', systemProductId: '' });
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-gray-400">Loading mappings...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Product Mappings</h2>
                    <p className="text-gray-400 mt-1">
                        Map Salla product names to your system products. Each Salla product can map to one system product.
                    </p>
                </div>
                <button
                    onClick={() => {
                        setShowAddForm(!showAddForm);
                        setEditingId(null);
                        setFormData({ sallaProductName: '', sallaSku: '', systemProductId: '' });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Mapping
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                    <p className="text-red-300 text-sm">{error}</p>
                </div>
            )}

            {/* Add Form */}
            {showAddForm && (
                <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Add New Mapping</h3>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Salla Product Name *
                            </label>
                            <input
                                type="text"
                                value={formData.sallaProductName}
                                onChange={(e) => setFormData({ ...formData, sallaProductName: e.target.value })}
                                placeholder="e.g., ماوس باد بطابع عربي - Arabian Mousepad"
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Salla SKU (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.sallaSku}
                                onChange={(e) => setFormData({ ...formData, sallaSku: e.target.value })}
                                placeholder="e.g., MP-L-001"
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                System Product *
                            </label>
                            <select
                                value={formData.systemProductId}
                                onChange={(e) => setFormData({ ...formData, systemProductId: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select product...</option>
                                {products.map((product) => (
                                    <option key={product.id} value={product.id}>
                                        {product.name} ({product.sku})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleAdd}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            Save Mapping
                        </button>
                        <button
                            onClick={() => {
                                setShowAddForm(false);
                                setFormData({ sallaProductName: '', sallaSku: '', systemProductId: '' });
                            }}
                            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Mappings Table */}
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-800/50 border-b border-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Salla Product Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Salla SKU
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                System Product
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/50">
                        {mappings.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                    No mappings yet. Click "Add Mapping" to create your first one.
                                </td>
                            </tr>
                        ) : (
                            mappings.map((mapping) => {
                                const isEditing = editingId === mapping.id;
                                const systemProduct = products.find((p) => p.id === mapping.system_product_id);

                                return (
                                    <tr key={mapping.id} className={isEditing ? 'bg-yellow-900/20' : 'hover:bg-gray-800/30'}>
                                        <td className="px-6 py-4 text-sm text-white">
                                            {mapping.salla_product_name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">
                                            {mapping.salla_sku || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {isEditing ? (
                                                <select
                                                    value={formData.systemProductId}
                                                    onChange={(e) => setFormData({ ...formData, systemProductId: e.target.value })}
                                                    className="w-full px-3 py-1 bg-gray-900 border border-gray-700 text-white rounded focus:ring-2 focus:ring-blue-500"
                                                >
                                                    {products.map((product) => (
                                                        <option key={product.id} value={product.id}>
                                                            {product.name} ({product.sku})
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <div>
                                                    <div className="font-medium text-white">{systemProduct?.name || 'Unknown'}</div>
                                                    <div className="text-gray-500 text-xs">{systemProduct?.sku}</div>
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

            {/* Stats */}
            {mappings.length > 0 && (
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                    <p className="text-sm text-gray-400">
                        Total mappings: <span className="font-semibold text-white">{mappings.length}</span>
                    </p>
                </div>
            )}
        </div>
    );
}
