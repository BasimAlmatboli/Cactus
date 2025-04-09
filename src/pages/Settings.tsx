import React from 'react';
import { ProductSettings } from '../components/settings/ProductSettings';
import { ShippingSettings } from '../components/settings/ShippingSettings';

export const Settings = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-8">Settings</h1>
        <ProductSettings />
        <ShippingSettings />
      </div>
    </div>
  );
};