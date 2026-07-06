import React, { useState, useEffect } from 'react';
import { ShippingMethod } from '../types';
import { shippingService } from '../services/shippingService';

interface ShippingSelectProps {
  selected: ShippingMethod | null;
  onSelect: (method: ShippingMethod) => void;
  isFreeShipping: boolean;
  onFreeShippingChange: (value: boolean) => void;
  onShippingCostChange: (cost: number) => void;
  customerShippingPrice: number;
  onCustomerShippingPriceChange: (price: number) => void;
}

export const ShippingSelect: React.FC<ShippingSelectProps> = ({
  selected,
  onSelect,
  isFreeShipping,
  onFreeShippingChange,
  onShippingCostChange,
  customerShippingPrice,
  onCustomerShippingPriceChange,
}) => {
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShippingMethods();
  }, []);

  const loadShippingMethods = async () => {
    try {
      setLoading(true);
      const methods = await shippingService.getActiveShippingMethods();
      setShippingMethods(methods);
    } catch (error) {
      console.error('Error loading shipping methods:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Shipping Method</h2>
        <div className="bg-[#1C1F26] rounded-xl border border-gray-800 p-8 text-center text-gray-500">
          Loading shipping methods...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Shipping Method</h2>
        <label className="flex items-center space-x-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={isFreeShipping}
            onChange={(e) => onFreeShippingChange(e.target.checked)}
            className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500/50 focus:ring-offset-0 transition-all"
          />
          <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Offer Free Shipping</span>
        </label>
      </div>
      <div className="space-y-3">
        {shippingMethods.map((method) => (
          <label
            key={method.id}
            className={`flex items-center justify-between p-5 bg-[#1C1F26] border rounded-xl cursor-pointer transition-all duration-200 ${selected?.id === method.id
                ? 'border-blue-500/50 ring-1 ring-blue-500/50 shadow-lg shadow-blue-500/10'
                : 'border-gray-800 hover:border-gray-700 hover:bg-[#232730]'
              }`}
          >
            <div className="flex items-center flex-1">
              <input
                type="radio"
                name="shipping"
                checked={selected?.id === method.id}
                onChange={() => onSelect(method)}
                className="mr-4 w-5 h-5 border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500/50 focus:ring-offset-0"
              />
              <span className={`text-lg ${selected?.id === method.id ? 'text-white' : 'text-gray-300'}`}>
                {method.name}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                {isFreeShipping ? (
                  <div className="flex flex-col items-end">
                    <span className="text-green-400 font-medium">Free</span>
                    <span className="text-xs text-gray-500 line-through">
                      {method.cost} SAR
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400">{method.cost} SAR</span>
                )}
              </div>
            </div>
          </label>
        ))}
      </div>

      {/* Shipping pricing: customer-charged (revenue) vs carrier cost (expense) */}
      {selected && (
        <div className="bg-[#1C1F26] border border-gray-800 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Customer pays (shipping)
              </label>
              <div className={`flex items-center bg-[#0F1115] rounded-lg border border-gray-700 px-3 py-2 ${isFreeShipping ? 'opacity-50' : ''}`}>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  disabled={isFreeShipping}
                  value={isFreeShipping ? 0 : customerShippingPrice}
                  onChange={(e) => onCustomerShippingPriceChange(parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent text-white focus:outline-none disabled:cursor-not-allowed"
                />
                <span className="ml-2 text-gray-500 text-sm">SAR</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Carrier cost (you pay)
              </label>
              <div className="flex items-center bg-[#0F1115] rounded-lg border border-gray-700 px-3 py-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={selected.cost}
                  onChange={(e) => onShippingCostChange(parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent text-white focus:outline-none"
                />
                <span className="ml-2 text-gray-500 text-sm">SAR</span>
              </div>
            </div>
          </div>

          {/* Live subsidy / margin hint */}
          {(() => {
            const charged = isFreeShipping ? 0 : customerShippingPrice;
            const subsidy = selected.cost - charged;
            if (Math.abs(subsidy) < 0.01) return null;
            return (
              <div className={`text-xs ${subsidy > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                {subsidy > 0
                  ? `You subsidize ${subsidy.toFixed(2)} SAR of shipping on this order.`
                  : `Shipping profit of ${Math.abs(subsidy).toFixed(2)} SAR on this order.`}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};