import React, { useState, useEffect } from 'react';
import { Discount, QuickDiscount } from '../types';
import { Tag, Loader2 } from 'lucide-react';
import { getQuickDiscounts } from '../services/quickDiscountService';


interface DiscountInputProps {
  onApplyDiscount: (discount: Discount | null) => void;
}

export const DiscountInput: React.FC<DiscountInputProps> = ({ onApplyDiscount }) => {
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [quickDiscounts, setQuickDiscounts] = useState<QuickDiscount[]>([]);
  const [isLoadingDiscounts, setIsLoadingDiscounts] = useState(true);

  // Load quick discounts from database
  useEffect(() => {
    const loadQuickDiscounts = async () => {
      try {
        setIsLoadingDiscounts(true);
        const discounts = await getQuickDiscounts(true); // activeOnly = true
        setQuickDiscounts(discounts);
      } catch (error) {
        console.error('Failed to load quick discounts:', error);
      } finally {
        setIsLoadingDiscounts(false);
      }
    };
    loadQuickDiscounts();
  }, []);

  const handleApplyDiscount = () => {
    if (!discountValue) {
      onApplyDiscount(null);
      return;
    }

    const value = Number(discountValue);
    if (isNaN(value) || value < 0) {
      alert('Please enter a valid discount value');
      return;
    }

    if (discountType === 'percentage' && value > 100) {
      alert('Percentage discount cannot exceed 100%');
      return;
    }

    onApplyDiscount({
      type: discountType,
      value,
      code: discountCode.trim() || undefined,
    });
  };

  const handleClearDiscount = () => {
    setDiscountValue('');
    setDiscountCode('');
    onApplyDiscount(null);
  };

  const handlePredefinedDiscount = (discount: Discount) => {
    setDiscountType(discount.type);
    setDiscountValue(discount.value.toString());
    setDiscountCode('');
    onApplyDiscount(discount);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
        <Tag className="h-5 w-5" />
        <span>Discount</span>
      </h2>

      <div className="bg-[#1C1F26] rounded-xl border border-gray-800 p-6 space-y-6">
        {/* Quick Apply Discounts */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-400">Quick Apply</label>
          {isLoadingDiscounts ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading discounts...</span>
            </div>
          ) : quickDiscounts.length === 0 ? (
            <p className="text-gray-500 text-sm">No quick discounts configured. Add them in Settings.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {quickDiscounts.map((discount) => (
                <button
                  key={discount.id}
                  onClick={() => handlePredefinedDiscount({ type: discount.type, value: discount.value })}
                  className="px-4 py-2 bg-[#232730] border border-gray-700 text-blue-400 rounded-lg text-sm font-medium hover:bg-[#2C313C] hover:border-blue-500/50 hover:text-blue-300 transition-all"
                  title={discount.name}
                >
                  {discount.type === 'percentage' ? `${discount.value}%` : `${discount.value} SAR`}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-6 p-4 bg-[#13151A] rounded-lg border border-gray-800">
          <label className="flex items-center cursor-pointer group">
            <input
              type="radio"
              checked={discountType === 'percentage'}
              onChange={() => setDiscountType('percentage')}
              className="mr-3 w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 focus:ring-blue-500/50"
            />
            <span className="text-gray-300 group-hover:text-white transition-colors">Percentage (%)</span>
          </label>
          <label className="flex items-center cursor-pointer group">
            <input
              type="radio"
              checked={discountType === 'fixed'}
              onChange={() => setDiscountType('fixed')}
              className="mr-3 w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 focus:ring-blue-500/50"
            />
            <span className="text-gray-300 group-hover:text-white transition-colors">Fixed Amount (SAR)</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              {discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
            </label>
            <div className="relative">
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="block w-full p-3 bg-[#13151A] border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                placeholder={discountType === 'percentage' ? '10' : '50'}
                min="0"
                step={discountType === 'percentage' ? '1' : '0.01'}
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <span className="text-gray-500 font-medium">
                  {discountType === 'percentage' ? '%' : 'SAR'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Discount Code (Optional)
            </label>
            <input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              className="block w-full p-3 bg-[#13151A] border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
              placeholder="SUMMER2024"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-800">
          <button
            onClick={handleApplyDiscount}
            className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20"
          >
            Apply Discount
          </button>
          <button
            onClick={handleClearDiscount}
            className="px-6 py-3 bg-[#232730] text-gray-300 border border-gray-700 rounded-xl hover:text-white hover:bg-[#2C313C] transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};