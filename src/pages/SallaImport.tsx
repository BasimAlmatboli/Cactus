import { useState } from 'react';
import { Upload, Database, History } from 'lucide-react';
import ProductMappingManager from '../components/salla/ProductMappingManager';
import ShippingMappingManager from '../components/salla/ShippingMappingManager';
import PaymentMappingManager from '../components/salla/PaymentMappingManager';
import SallaImportFlow from '../components/salla/SallaImportFlow';

export default function SallaImport() {
    const [activeTab, setActiveTab] = useState<'mappings' | 'import' | 'history'>('mappings');

    return (
        <div className="min-h-screen bg-[#0F1115] text-white">
            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Salla Import
                    </h1>
                    <p className="text-gray-400">
                        Manage product mappings and import orders from Salla platform
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="bg-gray-800/50 rounded-xl shadow-sm mb-6 border border-gray-700/50">
                    <div className="flex border-b border-gray-700">
                        <button
                            onClick={() => setActiveTab('mappings')}
                            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${activeTab === 'mappings'
                                ? 'text-blue-400 border-b-2 border-blue-400'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <Database className="w-5 h-5" />
                            Manage Mappings
                        </button>
                        <button
                            onClick={() => setActiveTab('import')}
                            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${activeTab === 'import'
                                ? 'text-blue-400 border-b-2 border-blue-400'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <Upload className="w-5 h-5" />
                            Import Orders
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${activeTab === 'history'
                                ? 'text-blue-400 border-b-2 border-blue-400'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <History className="w-5 h-5" />
                            Import History
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-gray-800/50 rounded-xl shadow-lg p-8 border border-gray-700/50">
                    {activeTab === 'mappings' && <MappingsTab />}
                    {activeTab === 'import' && <ImportTab />}
                    {activeTab === 'history' && <HistoryTab />}
                </div>
            </div>
        </div>
    );
}

function MappingsTab() {
    return (
        <div className="space-y-8">
            {/* Product Mappings */}
            <ProductMappingManager />

            {/* Divider */}
            <div className="border-t border-gray-700"></div>

            {/* Shipping & Payment in Grid */}
            <div className="grid grid-cols-2 gap-8">
                <ShippingMappingManager />
                <PaymentMappingManager />
            </div>
        </div>
    );
}

function ImportTab() {
    return <SallaImportFlow />;
}

function HistoryTab() {
    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-4">
                Import History
            </h2>
            <p className="text-gray-400 mb-6">
                View past imports and their results.
            </p>
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4">
                <p className="text-gray-400">
                    📋 No imports yet
                </p>
            </div>
        </div>
    );
}
