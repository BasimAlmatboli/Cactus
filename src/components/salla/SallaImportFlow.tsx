import { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, AlertTriangle, Play, X, ChevronDown, ChevronUp } from 'lucide-react';
import { parseSallaCSVWithLog, validateSallaOrder, ParseLogEntry } from '../../utils/sallaParser';
import {
    lookupProductByName,
    lookupShippingMethod,
    lookupPaymentMethod,
    fetchProductMappings
} from '../../services/sallaMappingService';

import { saveOrder } from '../../services/orderService';
import { useFreeShippingThreshold } from '../../hooks/useFreeShippingThreshold';
import { generateUUID } from '../../utils/uuid';
import { calculateCompleteOrder } from '../../utils/orderCalculations';
import type { SallaOrder, Product, ShippingMethod, PaymentMethod, SallaProductMapping, OrderItem, Order } from '../../types';

interface MappedOrder {
    sallaOrder: SallaOrder;
    mappedProducts: { sallaProduct: { name: string; quantity: number; sku: string }; systemProduct: Product | null }[];
    shippingMethod: ShippingMethod | null;
    paymentMethod: PaymentMethod | null;
    hasUnmappedProducts: boolean;
    validationErrors: string[];
}

interface ImportState {
    step: 'upload' | 'preview' | 'importing' | 'complete';
    file: File | null;
    orders: MappedOrder[];
    unmappedProductNames: string[];
    importProgress: number;
    importResults: { success: number; failed: number; errors: string[] };
    parseLog: ParseLogEntry[];
    parseSummary: { totalRows: number; successfulRows: number; failedRows: number; delimiter: string } | null;
}

export default function SallaImportFlow() {
    const { threshold: freeShippingThreshold } = useFreeShippingThreshold();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [state, setState] = useState<ImportState>({
        step: 'upload',
        file: null,
        orders: [],
        unmappedProductNames: [],
        importProgress: 0,
        importResults: { success: 0, failed: 0, errors: [] },
        parseLog: [],
        parseSummary: null,
    });
    const [loading, setLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState<string>('');
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [showParseLog, setShowParseLog] = useState(false);

    async function handleFileSelect(file: File) {
        setLoading(true);
        setLoadingStatus('Parsing CSV file...');
        setLoadingProgress(0);
        setError(null);

        try {
            // Parse CSV with detailed logging
            const parseResult = await parseSallaCSVWithLog(file);

            // Store parse log for debugging
            setState(s => ({
                ...s,
                parseLog: parseResult.parseLog,
                parseSummary: parseResult.summary,
            }));

            // Check if parsing had failures
            if (parseResult.summary.failedRows > 0) {
                const errorLogs = parseResult.parseLog.filter(l => l.status === 'error');
                const errorMessages = errorLogs.map(l => `Row ${l.rowNumber}: ${l.message}`).join('\n');
                throw new Error(`Failed to parse ${parseResult.summary.failedRows} row(s):\n${errorMessages}`);
            }

            if (parseResult.orders.length === 0) {
                throw new Error('No orders found in the file');
            }

            setLoadingStatus('Loading product mappings...');
            setLoadingProgress(10);

            // Get all product mappings for quick lookup
            const productMappings = await fetchProductMappings();
            const mappingsByName = new Map<string, SallaProductMapping>();
            productMappings.forEach(m => mappingsByName.set(m.salla_product_name, m));

            // Map each order with progress updates
            const mappedOrders: MappedOrder[] = [];
            const allUnmappedProducts = new Set<string>();
            const totalOrders = parseResult.orders.length;

            for (let i = 0; i < totalOrders; i++) {
                const sallaOrder = parseResult.orders[i];

                // Update progress every order
                const progress = Math.round(10 + ((i / totalOrders) * 85));
                setLoadingProgress(progress);
                setLoadingStatus(`Mapping orders... (${i + 1}/${totalOrders})`);

                const mappedProducts = await Promise.all(
                    sallaOrder.products.map(async (p) => {
                        const systemProduct = await lookupProductByName(p.name);
                        if (!systemProduct) {
                            allUnmappedProducts.add(p.name);
                        }
                        return {
                            sallaProduct: p,
                            systemProduct,
                        };
                    })
                );

                const shippingMethod = await lookupShippingMethod(sallaOrder.shippingCompany);
                const paymentMethod = await lookupPaymentMethod(sallaOrder.paymentMethod);
                const validationErrors = validateSallaOrder(sallaOrder);

                mappedOrders.push({
                    sallaOrder,
                    mappedProducts,
                    shippingMethod,
                    paymentMethod,
                    hasUnmappedProducts: mappedProducts.some(p => !p.systemProduct),
                    validationErrors,
                });
            }

            setLoadingProgress(100);
            setLoadingStatus('Complete!');

            setState(s => ({
                ...s,
                step: 'preview',
                file,
                orders: mappedOrders,
                unmappedProductNames: Array.from(allUnmappedProducts),
                importProgress: 0,
                importResults: { success: 0, failed: 0, errors: [] },
            }));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to parse file');
            setShowParseLog(true); // Auto-show parse log on error
        } finally {
            setLoading(false);
            setLoadingStatus('');
            setLoadingProgress(0);
        }
    }

    async function handleImport() {
        if (state.unmappedProductNames.length > 0) {
            setError('Cannot import with unmapped products. Please map all products first.');
            return;
        }

        // Validate that ALL orders have mapped shipping and payment methods (match Calculator validation)
        const ordersWithUnmappedMethods = state.orders.filter(o =>
            !o.shippingMethod || !o.paymentMethod
        );

        if (ordersWithUnmappedMethods.length > 0) {
            const errorList = ordersWithUnmappedMethods.map(o => {
                const missing: string[] = [];
                if (!o.shippingMethod) missing.push('shipping method');
                if (!o.paymentMethod) missing.push('payment method');
                return `Order ${o.sallaOrder.orderNumber}: Missing ${missing.join(' and ')}`;
            }).join('\n');

            setError(`Cannot import orders with unmapped methods:\n\n${errorList}\n\nPlease map all shipping and payment methods in the "Manage Mappings" tab first.`);
            return;
        }

        setState(s => ({ ...s, step: 'importing', importProgress: 0 }));

        let success = 0;
        let failed = 0;
        const errors: string[] = [];

        for (let i = 0; i < state.orders.length; i++) {
            const order = state.orders[i];

            try {
                // 1. Create order items
                const orderItems = order.mappedProducts.map(p => ({
                    product: {
                        id: p.systemProduct!.id,
                        name: p.systemProduct!.name,
                        sku: p.systemProduct!.sku,
                        cost: p.systemProduct!.cost,
                        sellingPrice: p.systemProduct!.sellingPrice,
                        owner: p.systemProduct!.owner
                    },
                    quantity: p.sallaProduct.quantity,
                }));

                // 2. Convert Salla discount to Discount type
                const discount = order.sallaOrder.discount > 0
                    ? { type: 'fixed' as const, value: order.sallaOrder.discount }
                    : null;

                // Validate payment and shipping methods are complete
                if (!order.shippingMethod || !order.paymentMethod) {
                    throw new Error(`Missing methods - Shipping: ${!!order.shippingMethod}, Payment: ${!!order.paymentMethod}`);
                }

                // ✅ USE CENTRALIZED CALCULATION FUNCTION
                // All business logic is now in ONE place: orderCalculations/completeOrder.ts
                const result = await calculateCompleteOrder({
                    orderItems: orderItems as OrderItem[],
                    shippingMethod: order.shippingMethod,
                    paymentMethod: order.paymentMethod,
                    discount,
                    freeShippingThreshold,
                });

                // 3. Construct Order Object from calculation result
                const newOrder: Order = {
                    id: generateUUID(),
                    orderNumber: order.sallaOrder.orderNumber,
                    customerName: order.sallaOrder.customerName,
                    date: order.sallaOrder.orderDate.toISOString(),
                    items: orderItems as OrderItem[],

                    shippingMethod: order.shippingMethod!, // Full object with all properties

                    paymentMethod: order.paymentMethod!, // Full object with all properties

                    subtotal: result.subtotal,
                    shippingCost: order.shippingMethod!.cost, // Store original cost (match Calculator)
                    paymentFees: result.paymentFees,

                    discount: discount, // Use the discount object we created

                    total: result.customerTotal,
                    netProfit: result.netProfit,
                    isFreeShipping: result.isFreeShipping,
                };

                // 8. Save Order using Service
                await saveOrder(newOrder);

                success++;
            } catch (err: any) {
                failed++;
                console.error('Import Error for order', order.sallaOrder.orderNumber, err);

                // Extract detailed error message
                let errorMessage = 'Unknown error';
                if (err instanceof Error) {
                    errorMessage = err.message;
                } else if (typeof err === 'object' && err !== null) {
                    if (err.message) errorMessage = err.message;
                    if (err.details) errorMessage += ` (${err.details})`;
                    if (err.hint) errorMessage += ` Hint: ${err.hint}`;
                } else {
                    errorMessage = String(err);
                }

                errors.push(`Order ${order.sallaOrder.orderNumber}: ${errorMessage}`);
            }

            setState(s => ({
                ...s,
                importProgress: Math.round(((i + 1) / state.orders.length) * 100),
            }));
        }

        setState(s => ({
            ...s,
            step: 'complete',
            importResults: { success, failed, errors },
        }));
    }

    function reset() {
        setState({
            step: 'upload',
            file: null,
            orders: [],
            unmappedProductNames: [],
            importProgress: 0,
            importResults: { success: 0, failed: 0, errors: [] },
            parseLog: [],
            parseSummary: null,
        });
        setError(null);
        setShowParseLog(false);
    }

    // Upload Step
    if (state.step === 'upload') {
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Import Orders from Salla</h2>
                    <p className="text-gray-400">Upload your Salla CSV export file to import orders into the system.</p>
                </div>

                {error && (
                    <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-red-300 whitespace-pre-wrap">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Parse Log Toggle */}
                {state.parseLog.length > 0 && (
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg overflow-hidden">
                        <button
                            onClick={() => setShowParseLog(!showParseLog)}
                            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-700/30"
                        >
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-gray-400" />
                                <span className="text-white font-medium">Parse Log</span>
                                {state.parseSummary && (
                                    <span className="text-gray-500 text-sm">
                                        ({state.parseSummary.successfulRows} success, {state.parseSummary.failedRows} failed, delimiter: {state.parseSummary.delimiter})
                                    </span>
                                )}
                            </div>
                            {showParseLog ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                        </button>

                        {showParseLog && (
                            <div className="border-t border-gray-700 max-h-96 overflow-y-auto">
                                {state.parseLog.map((entry, i) => (
                                    <div key={i} className={`px-4 py-2 border-b border-gray-700/50 ${entry.status === 'error' ? 'bg-red-900/20' :
                                        entry.status === 'warning' ? 'bg-yellow-900/20' :
                                            entry.status === 'success' ? 'bg-green-900/10' : ''
                                        }`}>
                                        <div className="flex items-start gap-3">
                                            <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${entry.status === 'error' ? 'bg-red-800 text-red-200' :
                                                entry.status === 'warning' ? 'bg-yellow-800 text-yellow-200' :
                                                    entry.status === 'success' ? 'bg-green-800 text-green-200' :
                                                        'bg-gray-700 text-gray-300'
                                                }`}>
                                                {entry.rowNumber > 0 ? `Row ${entry.rowNumber}` : 'Info'}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm ${entry.status === 'error' ? 'text-red-300' :
                                                    entry.status === 'warning' ? 'text-yellow-300' :
                                                        entry.status === 'success' ? 'text-green-300' :
                                                            'text-gray-300'
                                                    }`}>
                                                    {entry.message}
                                                </p>
                                                {entry.rawContent && (
                                                    <pre className="mt-1 text-xs text-gray-500 bg-gray-900/50 p-2 rounded overflow-x-auto">
                                                        {entry.rawContent}
                                                    </pre>
                                                )}
                                                {entry.columnCount !== undefined && (
                                                    <span className="text-xs text-gray-500">Columns: {entry.columnCount}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Loading Progress */}
                {loading && (
                    <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-8 text-center">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-lg text-white mb-2">{loadingStatus}</p>
                        <div className="w-full max-w-md mx-auto bg-gray-800 rounded-full h-3 mb-2">
                            <div
                                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                                style={{ width: `${loadingProgress}%` }}
                            ></div>
                        </div>
                        <p className="text-gray-400 text-sm">{loadingProgress}% complete</p>
                    </div>
                )}

                {/* Drop Zone - only show when not loading */}
                {!loading && (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); }}
                        onDrop={(e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files[0];
                            if (file) handleFileSelect(file);
                        }}
                        className="border-2 border-dashed border-gray-700 rounded-xl p-12 text-center cursor-pointer hover:border-blue-500 transition-colors"
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.tsv,.txt"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileSelect(file);
                            }}
                        />
                        <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        <p className="text-lg text-white mb-2">
                            Drop your Salla CSV file here
                        </p>
                        <p className="text-gray-500 text-sm">or click to browse</p>
                    </div>
                )}

                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                    <h4 className="text-white font-medium mb-2">Expected Format:</h4>
                    <p className="text-gray-400 text-sm">Tab or comma-separated values with columns: Order Number, Customer Name, Cart Total, Discount, Shipping Cost, Payment Method, COD Commission, Order Total, Order Date, Shipping Company, Products JSON</p>
                </div>
            </div>
        );
    }

    // Preview Step
    if (state.step === 'preview') {
        // Check for unmapped products AND unmapped methods
        const ordersWithUnmappedMethods = state.orders.filter(o => !o.shippingMethod || !o.paymentMethod);
        const canImport = state.unmappedProductNames.length === 0 && ordersWithUnmappedMethods.length === 0;
        const validOrders = state.orders.filter(o => !o.hasUnmappedProducts && o.validationErrors.length === 0 && o.shippingMethod && o.paymentMethod);

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Preview Import</h2>
                        <p className="text-gray-400">
                            File: <span className="text-white">{state.file?.name}</span> •
                            {state.orders.length} orders found
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={reset} className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600">
                            <X className="w-4 h-4 inline mr-2" />Cancel
                        </button>
                        <button
                            onClick={handleImport}
                            disabled={!canImport}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${canImport
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            <Play className="w-4 h-4" />
                            Import {validOrders.length} Orders
                        </button>
                    </div>
                </div>

                {/* Unmapped Products Warning */}
                {state.unmappedProductNames.length > 0 && (
                    <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-orange-300 font-medium mb-2">
                                    {state.unmappedProductNames.length} unmapped product(s) found
                                </p>
                                <p className="text-orange-200/70 text-sm mb-3">
                                    You must map these products in the "Manage Mappings" tab before importing.
                                </p>
                                <ul className="space-y-1">
                                    {state.unmappedProductNames.slice(0, 10).map((name, i) => (
                                        <li key={i} className="text-orange-200 text-sm">• {name}</li>
                                    ))}
                                    {state.unmappedProductNames.length > 10 && (
                                        <li className="text-orange-200/50 text-sm">...and {state.unmappedProductNames.length - 10} more</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Unmapped Shipping/Payment Methods Warning */}
                {ordersWithUnmappedMethods.length > 0 && (
                    <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-red-300 font-medium mb-2">
                                    {ordersWithUnmappedMethods.length} order(s) with unmapped shipping/payment methods
                                </p>
                                <p className="text-red-200/70 text-sm mb-3">
                                    You must map all shipping and payment methods in the "Manage Mappings" tab before importing.
                                </p>
                                <ul className="space-y-1">
                                    {ordersWithUnmappedMethods.slice(0, 5).map((o, i) => {
                                        const missing: string[] = [];
                                        if (!o.shippingMethod) missing.push('shipping');
                                        if (!o.paymentMethod) missing.push('payment');
                                        return (
                                            <li key={i} className="text-red-200 text-sm">
                                                • Order {o.sallaOrder.orderNumber}: Missing {missing.join(' and ')} method
                                            </li>
                                        );
                                    })}
                                    {ordersWithUnmappedMethods.length > 5 && (
                                        <li className="text-red-200/50 text-sm">...and {ordersWithUnmappedMethods.length - 5} more</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Orders Preview Table */}
                <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg overflow-hidden">
                    <div className="max-h-96 overflow-y-auto">
                        <table className="w-full">
                            <thead className="bg-gray-800/50 border-b border-gray-700 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Order #</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Customer</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Products</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Shipping</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Payment</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700/50">
                                {state.orders.map((order, i) => (
                                    <tr key={i} className={order.hasUnmappedProducts ? 'bg-red-900/10' : 'hover:bg-gray-800/30'}>
                                        <td className="px-4 py-3">
                                            {order.hasUnmappedProducts ? (
                                                <AlertCircle className="w-5 h-5 text-red-400" />
                                            ) : (
                                                <CheckCircle className="w-5 h-5 text-green-400" />
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-white">{order.sallaOrder.orderNumber}</td>
                                        <td className="px-4 py-3 text-sm text-gray-300">{order.sallaOrder.customerName}</td>
                                        <td className="px-4 py-3 text-sm">
                                            {order.mappedProducts.map((p, j) => (
                                                <div key={j} className={`${p.systemProduct ? 'text-gray-300' : 'text-red-400'}`}>
                                                    {p.sallaProduct.quantity}x {p.sallaProduct.name.slice(0, 30)}...
                                                </div>
                                            ))}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {order.shippingMethod ? (
                                                <span className="text-green-400">{order.shippingMethod.name}</span>
                                            ) : (
                                                <span className="text-orange-400">{order.sallaOrder.shippingCompany}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {order.paymentMethod ? (
                                                <span className="text-green-400">{order.paymentMethod.name}</span>
                                            ) : (
                                                <span className="text-orange-400">{order.sallaOrder.paymentMethod}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right text-white">{order.sallaOrder.orderTotal} SAR</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // Importing Step
    if (state.step === 'importing') {
        return (
            <div className="space-y-6 text-center py-12">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <h2 className="text-2xl font-bold text-white">Importing Orders...</h2>
                <p className="text-gray-400">{state.importProgress}% complete</p>
                <div className="w-full max-w-md mx-auto bg-gray-800 rounded-full h-2">
                    <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${state.importProgress}%` }}
                    ></div>
                </div>
            </div>
        );
    }

    // Complete Step
    return (
        <div className="space-y-6 text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
            <h2 className="text-2xl font-bold text-white">Import Complete!</h2>
            <div className="flex justify-center gap-8">
                <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                    <p className="text-3xl font-bold text-green-400">{state.importResults.success}</p>
                    <p className="text-green-300 text-sm">Imported</p>
                </div>
                {state.importResults.failed > 0 && (
                    <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                        <p className="text-3xl font-bold text-red-400">{state.importResults.failed}</p>
                        <p className="text-red-300 text-sm">Failed</p>
                    </div>
                )}
            </div>
            {state.importResults.errors.length > 0 && (
                <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 text-left max-w-lg mx-auto">
                    <p className="text-red-300 font-medium mb-2">Errors:</p>
                    {state.importResults.errors.slice(0, 5).map((e, i) => (
                        <p key={i} className="text-red-400 text-sm">• {e}</p>
                    ))}
                </div>
            )}
            <button onClick={reset} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Import More Orders
            </button>
        </div>
    );
}
