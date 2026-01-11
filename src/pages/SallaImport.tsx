import { useState } from 'react';
import { Upload, Database, FileText } from 'lucide-react';
import ProductMappingManager from '../components/salla/ProductMappingManager';
import ShippingMappingManager from '../components/salla/ShippingMappingManager';
import PaymentMappingManager from '../components/salla/PaymentMappingManager';
import SallaImportFlow from '../components/salla/SallaImportFlow';

export default function SallaImport() {
    const [activeTab, setActiveTab] = useState<'mappings' | 'import' | 'instructions'>('mappings');

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
                            onClick={() => setActiveTab('instructions')}
                            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${activeTab === 'instructions'
                                ? 'text-blue-400 border-b-2 border-blue-400'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <FileText className="w-5 h-5" />
                            Instructions
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-gray-800/50 rounded-xl shadow-lg p-8 border border-gray-700/50">
                    {activeTab === 'mappings' && <MappingsTab />}
                    {activeTab === 'import' && <ImportTab />}
                    {activeTab === 'instructions' && <InstructionsTab />}
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

function InstructionsTab() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                    تعليمات تجهيز ملف الإكسل
                </h2>
                <p className="text-gray-400">
                    خطوات مهمة لتجهيز ملف الإكسل من Salla قبل الاستيراد
                </p>
            </div>

            {/* Excel Preparation Steps */}
            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-700/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-300 mb-4 flex items-center gap-2">
                    📋 خطوات تجهيز الإكسل
                </h3>
                <div className="space-y-4 text-gray-200">
                    <div className="flex items-start gap-3 bg-gray-900/30 p-4 rounded-lg">
                        <span className="text-purple-400 font-bold text-lg shrink-0">1.</span>
                        <div>
                            <p className="font-semibold text-white mb-1">مراجعة حالة الطلب</p>
                            <p className="text-gray-300">مسح الطلبات الملغية أو طلبات الدفع عند الاستلام التي لم تستلم</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 bg-gray-900/30 p-4 rounded-lg">
                        <span className="text-purple-400 font-bold text-lg shrink-0">2.</span>
                        <div>
                            <p className="font-semibold text-white mb-1">تعديل تكلفة الشحن</p>
                            <p className="text-gray-300 mb-2">لازم تحط التكلفة الحقيقية:</p>
                            <ul className="text-gray-300 space-y-1 mr-4">
                                <li>• ريدبوكس: 15 ريال</li>
                                <li>• سمسا: 30 ريال</li>
                            </ul>
                            <div className="mt-2 bg-gray-800/50 px-3 py-1.5 rounded border border-gray-700 inline-block">
                                <code className="text-blue-400 text-sm">Alt, E, S, D, Enter</code>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 bg-gray-900/30 p-4 rounded-lg">
                        <span className="text-purple-400 font-bold text-lg shrink-0">3.</span>
                        <div>
                            <p className="font-semibold text-white mb-1">تعديل إجمالي الطلب لطلبات الدفع عند الاستلام</p>
                            <p className="text-gray-300 mb-2">اطرح عمولة الدفع من إجمالي الطلب</p>
                            <div className="bg-gray-800/50 p-3 rounded border border-gray-700">
                                <p className="text-gray-400 text-sm mb-1">مثال:</p>
                                <p className="text-gray-300">إجمالي الطلب: <span className="line-through text-red-400">128</span> → <span className="text-green-400 font-semibold">118</span> ريال</p>
                                <p className="text-gray-400 text-sm">(بعد طرح عمولة 10 ريال)</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 bg-gray-900/30 p-4 rounded-lg">
                        <span className="text-purple-400 font-bold text-lg shrink-0">4.</span>
                        <div>
                            <p className="font-semibold text-white">تعديل خصم الـ Mug</p>
                            <p className="text-gray-300">التأكد من تطبيق الخصم الصحيح لمنتجات Mug</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 bg-gray-900/30 p-4 rounded-lg">
                        <span className="text-purple-400 font-bold text-lg shrink-0">5.</span>
                        <div>
                            <p className="font-semibold text-white">تعديل اسم شركة الشحن سمسا</p>
                            <p className="text-gray-300">تغيير اسم شركة شحن سمسا الـ 20 ريال إلى <code className="bg-gray-800 px-2 py-0.5 rounded text-blue-400">SMSA-Eco</code></p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-700"></div>

            <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                    CSV Format Instructions
                </h2>
                <p className="text-gray-400">
                    Your CSV file must have the following 11 columns in this exact order (tab or comma separated)
                </p>
            </div>

            {/* Fields Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-900/50 border-b border-gray-700">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">#</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Arabic Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">English Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Format</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Example</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/50">
                        <tr className="hover:bg-gray-800/30">
                            <td className="px-4 py-3 text-blue-400 font-mono">0</td>
                            <td className="px-4 py-3 text-white">رقم الطلب</td>
                            <td className="px-4 py-3 text-gray-300">Order Number</td>
                            <td className="px-4 py-3 text-gray-400 font-mono text-sm">String</td>
                            <td className="px-4 py-3 text-gray-400 font-mono text-sm">224424682</td>
                        </tr>
                        <tr className="hover:bg-gray-800/30">
                            <td className="px-4 py-3 text-blue-400 font-mono">1</td>
                            <td className="px-4 py-3 text-white">اسم العميل</td>
                            <td className="px-4 py-3 text-gray-300">Customer Name</td>
                            <td className="px-4 py-3 text-gray-400 font-mono text-sm">String</td>
                            <td className="px-4 py-3 text-gray-400 font-mono text-sm">أحمد محمد</td>
                        </tr>
                        <tr className="hover:bg-gray-800/30">
                            <td className="px-4 py-3 text-blue-400 font-mono">2</td>
                            <td className="px-4 py-3 text-white">مجموع السلة</td>
                            <td className="px-4 py-3 text-gray-300">Cart Subtotal</td>
                            <td className="px-4 py-3 text-gray-400 font-mono text-sm">Number</td>
                            <td className="px-4 py-3 text-gray-400 font-mono text-sm">150.00</td>
                        </tr>
                        <tr className="hover:bg-gray-800/30">
                            <td className="px-4 py-3 text-blue-400 font-mono">3</td>
                            <td className="px-4 py-3 text-white">الخصم</td>
                            <td className="px-4 py-3 text-gray-300">Discount</td>
                            <td className="px-4 py-3 text-gray-400 font-mono text-sm">Number</td>
                            <td className="px-4 py-3 text-gray-400 font-mono text-sm">10.00</td>
                        </tr>
                        <tr className="hover:bg-gray-800/30">
                            <td className="px-4 py-3 text-blue-400 font-mono">4</td>
                            <td className="px-4 py-3 text-white">تكلفة الشحن</td>
                            <td className="px-4 py-3 text-gray-300">Shipping Cost</td>
                            <td className="px-4 py-3 text-gray-400 font-mono text-sm">Number</td>
                            <td className="px-4 py-3 text-gray-400 font-mono text-sm">20.00</td>
                        </tr>
                        <tr className="hover:bg-gray-800/30">
                            <td className="px-4 py-3 text-blue-400 font-mono">5</td>
                            <td className="px-4 py-3 text-white">طريقة الدفع</td>
                            <td className="px-4 py-3 text-gray-300">Payment Method</td>
                            <td className="px-4 py-3 text-gray-400 font-mono text-sm">String</td>
                            <td className="px-4 py-3 text-gray-400 font-mono text-sm">الدفع عند الإستلام</td>
                        </tr>
                        <tr className="hover:bg-gray-800/30">
                            <td className="px-4 py-3 text-blue-400 font-mono">6</td>
                            <td className="px-4 py-3 text-white">عمولة الدفع</td>
                            <td className="px-4 py-3 text-gray-300">COD Commission</td>
                            <td className="px-4 py-3 text-gray-400 font-mono text-sm">Number</td>
                            <td className="px-4 py-3 text-gray-400 font-mono text-sm">5.00</td>
                        </tr>
                        <tr className="hover:bg-gray-800/30">
                            <td className="px-4 py-3 text-blue-400 font-mono">7</td>
                            <td className="px-4 py-3 text-white">إجمالي الطلب</td>
                            <td className="px-4 py-3 text-gray-300">Order Total</td>
                            <td className="px-4 py-3 text-gray-400 font-mono text-sm">Number</td>
                            <td className="px-4 py-3 text-gray-400 font-mono text-sm">165.00</td>
                        </tr>
                        <tr className="hover:bg-gray-800/30">
                            <td className="px-4 py-3 text-blue-400 font-mono">8</td>
                            <td className="px-4 py-3 text-white">تاريخ الطلب</td>
                            <td className="px-4 py-3 text-gray-300">Order Date</td>
                            <td className="px-4 py-3 text-gray-400 font-mono text-sm">M/D/YYYY H:mm</td>
                            <td className="px-4 py-3 text-gray-400 font-mono text-sm">12/18/2025 11:46</td>
                        </tr>
                        <tr className="hover:bg-gray-800/30">
                            <td className="px-4 py-3 text-blue-400 font-mono">9</td>
                            <td className="px-4 py-3 text-white">شركة الشحن</td>
                            <td className="px-4 py-3 text-gray-300">Shipping Company</td>
                            <td className="px-4 py-3 text-gray-400 font-mono text-sm">String</td>
                            <td className="px-4 py-3 text-gray-400 font-mono text-sm">ريدبوكس</td>
                        </tr>
                        <tr className="hover:bg-gray-800/30 bg-blue-900/10">
                            <td className="px-4 py-3 text-blue-400 font-mono">10</td>
                            <td className="px-4 py-3 text-white">skus_json</td>
                            <td className="px-4 py-3 text-gray-300">Products JSON</td>
                            <td className="px-4 py-3 text-gray-400 font-mono text-sm">JSON Array</td>
                            <td className="px-4 py-3 text-gray-400 font-mono text-sm">See below ↓</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Products JSON Format */}
            <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-300 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Products JSON Format (Column 10)
                </h3>
                <p className="text-gray-300 mb-4">
                    The products must be in JSON array format with each product as: <code className="bg-gray-800 px-2 py-1 rounded text-blue-400">["Product Name", quantity, "SKU"]</code>
                </p>
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                    <p className="text-gray-400 text-sm mb-2 font-semibold">Example:</p>
                    <pre className="text-green-400 font-mono text-sm overflow-x-auto">
                        [["ماوس باد بطابع عربي - Arabian Mousepad", 1, "MP-L-001"], ["RGB Light Strip", 2, "RGB-001"]]
                    </pre>
                </div>
            </div>

            {/* Important Notes */}
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-300 mb-3">⚠️ Important Notes</h3>
                <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                        <span className="text-yellow-400 mt-1">•</span>
                        <span>File must be <strong>tab-separated</strong> (.tsv) or <strong>comma-separated</strong> (.csv)</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-yellow-400 mt-1">•</span>
                        <span>All 11 columns are <strong>required</strong> in the exact order shown above</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-yellow-400 mt-1">•</span>
                        <span>Products must be mapped in the <strong>"Manage Mappings"</strong> tab before importing</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-yellow-400 mt-1">•</span>
                        <span>Shipping and payment methods must also be mapped before importing</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
