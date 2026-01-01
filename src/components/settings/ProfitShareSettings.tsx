import React, { useState, useEffect } from 'react';
import { Users, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { getProducts } from '../../data/products';
import { getPartners, getProductProfitShares, profitShareCache } from '../../services/profitShareService';
import { supabase } from '../../lib/supabase';

interface Partner {
    id: string;
    name: string;
    display_name: string;
}

interface Product {
    id: string;
    name: string;
}

interface ProfitShareEdit {
    [partnerId: string]: number;
}

export const ProfitShareSettings: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [profitShares, setProfitShares] = useState<{ [productId: string]: ProfitShareEdit }>({});
    const [editedShares, setEditedShares] = useState<{ [productId: string]: ProfitShareEdit }>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load products and partners
            const [productsData, partnersData] = await Promise.all([
                getProducts(),
                getPartners()
            ]);

            setProducts(productsData);
            setPartners(partnersData);

            // Load profit shares for all products
            const shares: { [productId: string]: ProfitShareEdit } = {};

            for (const product of productsData) {
                const productShares = await getProductProfitShares(product.id);
                shares[product.id] = {};

                productShares.forEach(share => {
                    if (share.partner) {
                        shares[product.id][share.partner.id] = Number(share.share_percentage);
                    }
                });
            }

            setProfitShares(shares);
            setEditedShares(JSON.parse(JSON.stringify(shares))); // Deep copy
        } catch (err) {
            console.error('Error loading data:', err);
            setError('Failed to load profit share data');
        } finally {
            setLoading(false);
        }
    };

    const handleShareChange = (productId: string, partnerId: string, value: string) => {
        const numValue = parseFloat(value) || 0;

        setEditedShares(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                [partnerId]: numValue
            }
        }));
    };

    const calculateTotal = (productId: string): number => {
        const shares = editedShares[productId] || {};
        return Object.values(shares).reduce((sum, val) => sum + val, 0);
    };

    const isValid = (productId: string): boolean => {
        const total = calculateTotal(productId);
        return Math.abs(total - 100) < 0.01; // Allow small floating point errors
    };

    const hasChanges = (productId: string): boolean => {
        const original = profitShares[productId] || {};
        const edited = editedShares[productId] || {};

        return partners.some(partner =>
            (original[partner.id] || 0) !== (edited[partner.id] || 0)
        );
    };

    const handleSave = async (productId: string) => {
        if (!isValid(productId)) {
            setError('Profit shares must sum to exactly 100%');
            return;
        }

        try {
            setSaving(productId);
            setError(null);
            setSuccessMessage(null);

            // Prepare shares data for RPC function
            const shares = editedShares[productId];
            const sharesArray = partners.map(partner => ({
                partner_id: partner.id,
                share_percentage: shares[partner.id] || 0
            }));

            // Call RPC function to update shares
            const { error: rpcError } = await supabase.rpc('update_product_profit_shares', {
                p_product_id: productId,
                p_shares: sharesArray
            });

            if (rpcError) {
                console.error('RPC Error:', rpcError);
                throw rpcError;
            }

            // Clear cache to force reload
            profitShareCache.clear();

            // Update local state
            setProfitShares(prev => ({
                ...prev,
                [productId]: { ...editedShares[productId] }
            }));

            const product = products.find(p => p.id === productId);
            setSuccessMessage(`Saved profit shares for ${product?.name}`);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            console.error('Error saving profit shares:', err);
            setError(err.message || 'Failed to save profit shares');
        } finally {
            setSaving(null);
        }
    };

    const handleReset = (productId: string) => {
        setEditedShares(prev => ({
            ...prev,
            [productId]: { ...profitShares[productId] }
        }));
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Users className="h-6 w-6 text-blue-600" />
                    <h2 className="text-xl font-semibold">Profit Share Settings</h2>
                </div>
                <p className="text-gray-500">Loading profit shares...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-6">
                <Users className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold">Profit Share Settings</h2>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {successMessage && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-green-800">{successMessage}</p>
                </div>
            )}

            <div className="space-y-6">
                {products.map(product => {
                    const total = calculateTotal(product.id);
                    const valid = isValid(product.id);
                    const changed = hasChanges(product.id);

                    return (
                        <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-medium text-lg">{product.name}</h3>
                                    <div className={`text-sm mt-1 ${valid ? 'text-green-600' : 'text-red-600'}`}>
                                        Total: {total.toFixed(1)}% {valid ? '✓' : '⚠ Must equal 100%'}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {changed && (
                                        <button
                                            onClick={() => handleReset(product.id)}
                                            disabled={saving === product.id}
                                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
                                        >
                                            Reset
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleSave(product.id)}
                                        disabled={!valid || !changed || saving === product.id}
                                        className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${valid && changed
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        <Save className="h-4 w-4" />
                                        {saving === product.id ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {partners.map(partner => (
                                    <div key={partner.id} className="flex items-center gap-3">
                                        <label className="flex-1 text-sm font-medium text-gray-700">
                                            {partner.display_name}
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.1"
                                                value={editedShares[product.id]?.[partner.id] || 0}
                                                onChange={(e) => handleShareChange(product.id, partner.id, e.target.value)}
                                                disabled={saving === product.id}
                                                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                            />
                                            <span className="text-gray-600">%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">💡 Tips:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Profit shares must sum to exactly 100% for each product</li>
                    <li>• Changes are saved per product individually</li>
                    <li>• Cache is automatically cleared after saving</li>
                    <li>• New orders will use the updated percentages immediately</li>
                </ul>
            </div>
        </div>
    );
};
