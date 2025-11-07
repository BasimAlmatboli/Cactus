import React, { useState, useEffect } from 'react';
import { ShippingMethod } from '../types';
import { shippingService } from '../services/shippingService';

interface ShippingSelectProps {
  selected: ShippingMethod | null;
  onSelect: (method: ShippingMethod) => void;
  isFreeShipping: boolean;
  onFreeShippingChange: (value: boolean) => void;
  onShippingCostChange: (cost: number) => void;
}

export const ShippingSelect: React.FC<ShippingSelectProps> = ({
  selected,
  onSelect,
  isFreeShipping,
  onFreeShippingChange,
  onShippingCostChange,
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
        <h2 className="text-lg font-semibold">Shipping Method</h2>
        <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500">
          Loading shipping methods...
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Shipping Method</h2>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isFreeShipping}
            onChange={(e) => onFreeShippingChange(e.target.checked)}
            className="rounded text-blue-500 focus:ring-blue-500"
          />
          <span className="text-sm font-medium">Offer Free Shipping</span>
        </label>
      </div>
      <div className="space-y-2">
        {shippingMethods.map((method) => (
          <label
            key={method.id}
            className={`flex items-center justify-between p-4 bg-white rounded-lg shadow cursor-pointer ${
              selected?.id === method.id ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="flex items-center flex-1">
              <input
                type="radio"
                name="shipping"
                checked={selected?.id === method.id}
                onChange={() => onSelect(method)}
                className="mr-3"
              />
              <span>{method.name}</span>
            </div>
            <div className="flex items-center space-x-4">
              {selected?.id === method.id && (
                <div className="flex items-center">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={selected.cost}
                    onChange={(e) => onShippingCostChange(parseFloat(e.target.value) || 0)}
                    className="w-24 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-2">SAR</span>
                </div>
              )}
              {selected?.id !== method.id && (
                <div className="text-right">
                  {isFreeShipping ? (
                    <div className="flex flex-col items-end">
                      <span className="text-green-600 font-medium">Free</span>
                      <span className="text-sm text-gray-400 line-through">
                        {method.cost} SAR
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-600">{method.cost} SAR</span>
                  )}
                </div>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};