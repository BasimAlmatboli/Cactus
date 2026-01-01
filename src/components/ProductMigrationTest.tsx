import React, { useState } from 'react';
import { runMigrationTest } from '../utils/testProductMigration';
import { getProducts as getProductsFromLocalStorage } from '../data/products';
import { getProducts as getProductsFromDatabase } from '../services/productService';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

export const ProductMigrationTest = () => {
    const [testing, setTesting] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [localProducts, setLocalProducts] = useState<any[]>([]);
    const [dbProducts, setDbProducts] = useState<any[]>([]);

    const runTest = async () => {
        setTesting(true);
        setResult(null);

        try {
            // Get products from both sources
            const local = await getProductsFromLocalStorage();
            const db = await getProductsFromDatabase();

            setLocalProducts(local);
            setDbProducts(db);

            // Run comparison
            const testResult = await runMigrationTest();
            setResult(testResult);
        } catch (error) {
            console.error('Test failed:', error);
            setResult(false);
        } finally {
            setTesting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold mb-4">Product Migration Test</h1>
                <p className="text-gray-600 mb-6">
                    This test compares products from localStorage with the database to ensure migration accuracy.
                </p>

                <button
                    onClick={runTest}
                    disabled={testing}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${testing
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                >
                    <RefreshCw className={`h-5 w-5 ${testing ? 'animate-spin' : ''}`} />
                    {testing ? 'Running Test...' : 'Run Migration Test'}
                </button>

                {result !== null && (
                    <div className="mt-6">
                        <div
                            className={`p-4 rounded-lg flex items-start gap-3 ${result
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-red-50 border border-red-200'
                                }`}
                        >
                            {result ? (
                                <>
                                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-green-900 mb-1">
                                            ✅ Migration Test Passed!
                                        </h3>
                                        <p className="text-green-700">
                                            All products match perfectly between localStorage and database.
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-red-900 mb-1">
                                            ❌ Migration Test Failed
                                        </h3>
                                        <p className="text-red-700">
                                            Discrepancies found. Check console for details.
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-gray-900 mb-2">
                                    📦 LocalStorage
                                </h3>
                                <p className="text-3xl font-bold text-blue-600">
                                    {localProducts.length}
                                </p>
                                <p className="text-sm text-gray-600">products</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-gray-900 mb-2">
                                    🗄️ Database
                                </h3>
                                <p className="text-3xl font-bold text-green-600">
                                    {dbProducts.length}
                                </p>
                                <p className="text-sm text-gray-600">products</p>
                            </div>
                        </div>

                        {localProducts.length > 0 && (
                            <div className="mt-6">
                                <h3 className="font-semibold text-gray-900 mb-3">
                                    Product Comparison
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Product
                                                </th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                    SKU
                                                </th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Cost
                                                </th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Price
                                                </th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Owner
                                                </th>
                                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {localProducts.map((localProduct) => {
                                                const dbProduct = dbProducts.find(
                                                    (p) => p.id === localProduct.id
                                                );
                                                const matches = dbProduct &&
                                                    dbProduct.name === localProduct.name &&
                                                    dbProduct.sku === localProduct.sku &&
                                                    dbProduct.cost === localProduct.cost &&
                                                    dbProduct.sellingPrice === localProduct.sellingPrice &&
                                                    dbProduct.owner === localProduct.owner;

                                                return (
                                                    <tr key={localProduct.id} className={!dbProduct ? 'bg-red-50' : ''}>
                                                        <td className="px-4 py-2 text-sm text-gray-900">
                                                            {localProduct.name}
                                                        </td>
                                                        <td className="px-4 py-2 text-sm text-gray-600">
                                                            {localProduct.sku}
                                                        </td>
                                                        <td className="px-4 py-2 text-sm text-gray-600">
                                                            {localProduct.cost} SAR
                                                        </td>
                                                        <td className="px-4 py-2 text-sm text-gray-600">
                                                            {localProduct.sellingPrice} SAR
                                                        </td>
                                                        <td className="px-4 py-2 text-sm text-gray-600">
                                                            {localProduct.owner}
                                                        </td>
                                                        <td className="px-4 py-2 text-center">
                                                            {!dbProduct ? (
                                                                <XCircle className="h-5 w-5 text-red-600 mx-auto" />
                                                            ) : matches ? (
                                                                <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                                                            ) : (
                                                                <AlertCircle className="h-5 w-5 text-yellow-600 mx-auto" />
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Instructions</h3>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                        <li>Click "Run Migration Test" to compare products</li>
                        <li>Check the console for detailed comparison output</li>
                        <li>Verify all products match between localStorage and database</li>
                        <li>If test passes, migration is successful!</li>
                    </ol>
                </div>
            </div>
        </div>
    );
};
