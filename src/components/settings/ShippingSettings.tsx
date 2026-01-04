import React, { useState, useEffect } from 'react';
import { ShippingMethod } from '../../types';
import { shippingService } from '../../services/shippingService';
import { Save, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

export const ShippingSettings = () => {
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newMethodName, setNewMethodName] = useState('');
  const [newMethodCost, setNewMethodCost] = useState('');

  useEffect(() => {
    loadShippingMethods();
  }, []);

  const loadShippingMethods = async () => {
    try {
      setLoading(true);
      const methods = await shippingService.getShippingMethods();
      setShippingMethods(methods);
    } catch (error) {
      console.error('Error loading shipping methods:', error);
      alert('Failed to load shipping methods');
    } finally {
      setLoading(false);
    }
  };

  const handleShippingChange = (id: string, cost: number) => {
    setShippingMethods(methods =>
      methods.map(method =>
        method.id === id ? { ...method, cost } : method
      )
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      for (const method of shippingMethods) {
        await shippingService.updateShippingMethod(method.id, { cost: method.cost });
      }
      alert('Changes saved successfully!');
    } catch (error) {
      console.error('Error saving shipping methods:', error);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMethod = async () => {
    if (!newMethodName.trim() || !newMethodCost) {
      alert('Please enter both name and cost');
      return;
    }

    try {
      const newMethod = await shippingService.createShippingMethod(
        newMethodName.trim(),
        Number(newMethodCost)
      );
      setShippingMethods([...shippingMethods, newMethod]);
      setNewMethodName('');
      setNewMethodCost('');
      alert('Shipping method added successfully!');
    } catch (error) {
      console.error('Error adding shipping method:', error);
      alert('Failed to add shipping method');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await shippingService.toggleShippingMethodStatus(id, !currentStatus);
      setShippingMethods(methods =>
        methods.map(m => m.id === id ? { ...m, is_active: !currentStatus } : m)
      );
      alert(`Shipping method ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error('Error toggling shipping method status:', error);
      alert('Failed to toggle shipping method status');
    }
  };

  const handleDeleteMethod = async (id: string) => {
    if (!confirm('Are you sure you want to PERMANENTLY DELETE this shipping method? This action cannot be undone.')) {
      return;
    }

    try {
      await shippingService.deleteShippingMethod(id);
      setShippingMethods(methods => methods.filter(m => m.id !== id));
      alert('Shipping method permanently deleted!');
    } catch (error) {
      console.error('Error deleting shipping method:', error);
      alert('Failed to delete shipping method');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 mt-8">
        <h2 className="text-xl font-semibold text-white">Shipping Settings</h2>
        <div className="bg-gray-800 rounded-lg shadow p-8 text-center border border-gray-700">
          <p className="text-gray-400">Loading shipping methods...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Shipping Settings</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="bg-gray-900/50 rounded-lg shadow p-6 space-y-4 border border-gray-700">
        <h3 className="text-lg font-medium text-white">Add New Shipping Method</h3>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Method Name
            </label>
            <input
              type="text"
              value={newMethodName}
              onChange={(e) => setNewMethodName(e.target.value)}
              placeholder="e.g., Express Delivery"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder-gray-400"
            />
          </div>
          <div className="w-40">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Cost (SAR)
            </label>
            <input
              type="number"
              value={newMethodCost}
              onChange={(e) => setNewMethodCost(e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder-gray-400"
            />
          </div>
          <button
            onClick={handleAddMethod}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add</span>
          </button>
        </div>
      </div>

      <div className="bg-gray-900/50 rounded-lg shadow overflow-hidden border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Shipping Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Cost (SAR)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-900/50 divide-y divide-gray-700">
            {shippingMethods.map((method) => (
              <tr key={method.id} className={!method.is_active ? 'bg-gray-800/50 opacity-60' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${method.is_active ? 'text-white' : 'text-gray-500 line-through'}`}>
                    {method.name}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    value={method.cost}
                    onChange={(e) => handleShippingChange(method.id, Number(e.target.value))}
                    min="0"
                    step="0.01"
                    className="w-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${method.is_active
                      ? 'bg-green-900/40 text-green-300'
                      : 'bg-gray-800 text-gray-400'
                    }`}>
                    {method.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleStatus(method.id, method.is_active)}
                      className={`transition-colors ${method.is_active
                          ? 'text-gray-400 hover:text-gray-200'
                          : 'text-green-400 hover:text-green-300'
                        }`}
                      title={method.is_active ? 'Deactivate shipping method' : 'Activate shipping method'}
                    >
                      {method.is_active ? (
                        <ToggleRight className="h-5 w-5" />
                      ) : (
                        <ToggleLeft className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteMethod(method.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Permanently delete shipping method"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};