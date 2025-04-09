import React, { useState } from 'react';
import { Discount } from '../types';
import { Tag } from 'lucide-react';

interface DiscountInputProps {
  onApplyDiscount: (discount: Discount | null) => void;
}

const PREDEFINED_DISCOUNTS: Discount[] = [
  { type: 'percentage', value: 10 },
  { type: 'percentage', value: 15 },
  { type: 'percentage', value: 20 },
  { type: 'fixed', value: 39.5 },
  { type: 'fixed', value: 79 },
];

export const DiscountInput: React.FC<DiscountInputProps> = ({ onApplyDiscount }) => {
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [discountCode, setDiscountCode] = useState('');

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
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Tag className="h-5 w-5" />
        <span>Discount</span>
      </h2>
      
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        {/* Predefined Discounts */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Quick Apply</label>
          <div className="flex flex-wrap gap-2">
            {PREDEFINED_DISCOUNTS.map((discount, index) => (
              <button
                key={index}
                onClick={() => handlePredefinedDiscount(discount)}
                className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                {discount.type === 'percentage' ? `${discount.value}%` : `${discount.value} SAR`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              checked={discountType === 'percentage'}
              onChange={() => setDiscountType('percentage')}
              className="mr-2"
            />
            Percentage (%)
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={discountType === 'fixed'}
              onChange={() => setDiscountType('fixed')}
              className="mr-2"
            />
            Fixed Amount (SAR)
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder={discountType === 'percentage' ? '10' : '50'}
                min="0"
                step={discountType === 'percentage' ? '1' : '0.01'}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">
                  {discountType === 'percentage' ? '%' : 'SAR'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Discount Code (Optional)
            </label>
            <input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="SUMMER2024"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleApplyDiscount}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Apply Discount
          </button>
          <button
            onClick={handleClearDiscount}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};