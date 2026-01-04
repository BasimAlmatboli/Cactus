import React from 'react';
import { PaymentMethod } from '../types';

interface PaymentSelectProps {
  selected: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
}

export const PaymentSelect: React.FC<PaymentSelectProps> = ({
  selected,
  onSelect,
}) => {
  const paymentMethods: PaymentMethod[] = [
    { id: 'mada', name: 'MADA' },
    { id: 'visa', name: 'Visa' },
    { id: 'tamara', name: 'Tamara' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Payment Method</h2>
      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <label
            key={method.id}
            className={`flex items-center p-5 bg-[#1C1F26] border rounded-xl cursor-pointer transition-all duration-200 ${selected?.id === method.id
                ? 'border-blue-500/50 ring-1 ring-blue-500/50 shadow-lg shadow-blue-500/10'
                : 'border-gray-800 hover:border-gray-700 hover:bg-[#232730]'
              }`}
          >
            <input
              type="radio"
              name="payment"
              checked={selected?.id === method.id}
              onChange={() => onSelect(method)}
              className="mr-4 w-5 h-5 border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500/50 focus:ring-offset-0"
            />
            <span className={`text-lg ${selected?.id === method.id ? 'text-white' : 'text-gray-300'}`}>
              {method.name}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};