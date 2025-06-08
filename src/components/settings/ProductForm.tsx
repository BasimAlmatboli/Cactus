import React, { useState } from 'react';
import { Product } from '../../types';
import { getProducts, saveProducts, generateUniqueSKU } from '../../data/products';
import { Plus } from 'lucide-react';

export const ProductForm = () => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [cost, setCost] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [owner, setOwner] = useState<'yassir' | 'basim'>('basim');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !cost || !sellingPrice) {
      alert('Please fill in all required fields');
      return;
    }

    const products = getProducts();
    
    // Generate SKU if not provided
    const finalSku = sku.trim() || generateUniqueSKU(name, products);
    
    // Check for duplicate SKU
    if (products.some(p => p.sku === finalSku)) {
      alert('SKU already exists. Please use a different SKU.');
      return;
    }

    const newProduct: Product = {
      id: Date.now().toString(),
      name,
      sku: finalSku,
      cost: Number(cost),
      sellingPrice: Number(sellingPrice),
      owner
    };

    saveProducts([...products, newProduct]);
    
    // Reset form
    setName('');
    setSku('');
    setCost('');
    setSellingPrice('');
    setOwner('basim');
    
    // Refresh the page to show new product
    window.location.reload();
  };

  const handleNameChange = (newName: string) => {
    setName(newName);
    // Auto-generate SKU if SKU field is empty
    if (!sku.trim() && newName.trim()) {
      const products = getProducts();
      setSku(generateUniqueSKU(newName, products));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h3 className="text-lg font-semibold mb-4">Add New Product</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Product Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter product name"
              required
            />
          </div>

          <div>
            <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
              SKU (Stock Keeping Unit)
            </label>
            <input
              type="text"
              id="sku"
              value={sku}
              onChange={(e) => setSku(e.target.value.toUpperCase())}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Auto-generated if empty"
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave empty to auto-generate from product name
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="cost" className="block text-sm font-medium text-gray-700">
              Cost (SAR) *
            </label>
            <input
              type="number"
              id="cost"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div>
            <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700">
              Selling Price (SAR) *
            </label>
            <input
              type="number"
              id="sellingPrice"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="owner" className="block text-sm font-medium text-gray-700">
            Product Owner
          </label>
          <select
            id="owner"
            value={owner}
            onChange={(e) => setOwner(e.target.value as 'yassir' | 'basim')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="basim">Basim</option>
            <option value="yassir">Yassir</option>
          </select>
        </div>

        <button
          type="submit"
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </button>
      </form>
    </div>
  );
};