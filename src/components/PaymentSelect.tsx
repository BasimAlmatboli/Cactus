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
      <h2 className="text-lg font-semibold">Payment Method</h2>
      <div className="space-y-2">
        {paymentMethods.map((method) => (
          <label
            key={method.id}
            className={`flex items-center p-4 bg-white rounded-lg shadow cursor-pointer ${
              selected?.id === method.id ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <input
              type="radio"
              name="payment"
              checked={selected?.id === method.id}
              onChange={() => onSelect(method)}
              className="mr-3"
            />
            <span>{method.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
};