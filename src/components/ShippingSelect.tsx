import React from 'react';
import { ShippingMethod } from '../types';
import { getShippingMethods } from '../data/shipping';

interface ShippingSelectProps {
  selected: ShippingMethod | null;
  onSelect: (method: ShippingMethod) => void;
  isFreeShipping: boolean;
  onFreeShippingChange: (value: boolean) => void;
}

export const ShippingSelect: React.FC<ShippingSelectProps> = ({
  selected,
  onSelect,
  isFreeShipping,
  onFreeShippingChange,
}) => {
  const shippingMethods = getShippingMethods();
  
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
          </label>
        ))}
      </div>
    </div>
  );
};