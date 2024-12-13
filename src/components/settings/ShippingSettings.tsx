import React, { useState, useEffect } from 'react';
import { ShippingMethod } from '../../types';
import { getShippingMethods, saveShippingMethods } from '../../data/shipping';
import { Save } from 'lucide-react';

export const ShippingSettings = () => {
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);

  useEffect(() => {
    setShippingMethods(getShippingMethods());
  }, []);

  const handleShippingChange = (id: string, cost: number) => {
    setShippingMethods(methods =>
      methods.map(method =>
        method.id === id ? { ...method, cost } : method
      )
    );
  };

  const handleSave = () => {
    saveShippingMethods(shippingMethods);
    alert('Changes saved successfully!');
  };

  return (
    <div className="space-y-4 mt-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Shipping Settings</h2>
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Save className="h-4 w-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shipping Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cost (SAR)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {shippingMethods.map((method) => (
              <tr key={method.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">
                    {method.name}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    value={method.cost}
                    onChange={(e) => handleShippingChange(method.id, Number(e.target.value))}
                    className="w-32 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};