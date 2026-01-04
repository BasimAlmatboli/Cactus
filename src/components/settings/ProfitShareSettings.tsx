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

            // @ts-ignore - Supabase types need regeneration for custom RPC functions
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
            <div className="bg-[#1C1F26] rounded-xl border border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Users className="h-6 w-6 text-blue-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">Profit Share Settings</h2>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-blue-500"></div>
                    <p>Loading profit shares...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {error && (
                <div className="mb-4 p-4 bg-red-900/30 border border-red-700 rounded-lg flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-300">{error}</p>
                </div>
            )}

            {successMessage && (
                <div className="mb-4 p-4 bg-green-900/30 border border-green-700 rounded-lg flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-green-300">{successMessage}</p>
                </div>
            )}

            <div className="space-y-4">
                {products.map(product => {
                    const total = calculateTotal(product.id);
                    const valid = isValid(product.id);
                    const changed = hasChanges(product.id);

                    return (
                        <div key={product.id} className="border border-gray-700 rounded-lg p-4 bg-gray-900/50">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-medium text-base text-gray-200">{product.name}</h3>
                                    <div className={`text-sm mt-1 ${valid ? 'text-green-400' : 'text-red-400'}`}>
                                        Total: {total.toFixed(1)}% {valid ? '✓' : '⚠ Must equal 100%'}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {changed && (
                                        <button
                                            onClick={() => handleReset(product.id)}
                                            disabled={saving === product.id}
                                            className="px-3 py-1 text-sm text-gray-400 hover:text-gray-200 disabled:opacity-50"
                                        >
                                            Reset
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleSave(product.id)}
                                        disabled={!valid || !changed || saving === product.id}
                                        className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${valid && changed
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
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
                                        <label className="flex-1 text-sm font-medium text-gray-300">
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
                                                className="w-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-800"
                                            />
                                            <span className="text-gray-400">%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
                <h4 className="font-medium text-blue-300 mb-2">💡 Tips:</h4>
                <ul className="text-sm text-blue-200 space-y-1">
                    <li>• Profit shares must sum to exactly 100% for each product</li>
                    <li>• Changes are saved per product individually</li>
                    <li>• Cache is automatically cleared after saving</li>
                    <li>• New orders will use the updated percentages immediately</li>
                </ul>
            </div>
        </div>
    );
};
