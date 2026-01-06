import React, { useState, useEffect } from 'react';
import { PaymentMethod } from '../types';
import { fetchPaymentMethods } from '../services/paymentMethodService';
import { Loader2 } from 'lucide-react';

interface PaymentSelectProps {
  selected: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
}

export const PaymentSelect: React.FC<PaymentSelectProps> = ({
  selected,
  onSelect,
}) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      setError(null);
      const methods = await fetchPaymentMethods(true); // Only active methods
      setPaymentMethods(methods);
    } catch (err) {
      console.error('Failed to load payment methods:', err);
      setError('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Payment Method</h2>
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Payment Method</h2>
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 text-red-300">
          {error}
        </div>
      </div>
    );
  }

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
            <div className="flex-1">
              <span className={`text-lg ${selected?.id === method.id ? 'text-white' : 'text-gray-300'}`}>
                {method.name}
              </span>
              <p className="text-xs text-gray-500 mt-1">
                Gateway: {method.fee_percentage}% + {method.fee_fixed} SAR
                {method.customer_fee > 0 && ` • Customer Fee: ${method.customer_fee} SAR`}
              </p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};