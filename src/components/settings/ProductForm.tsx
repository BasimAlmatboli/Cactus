import React, { useState } from 'react';
import { Product } from '../../types';
import { getProducts, saveProducts } from '../../data/products';
import { Plus } from 'lucide-react';

export const ProductForm = () => {
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [owner, setOwner] = useState<'yassir' | 'basim'>('basim');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !cost || !sellingPrice) {
      alert('Please fill in all fields');
      return;
    }

    const products = getProducts();
    const newProduct: Product = {
      id: Date.now().toString(),
      name,
      cost: Number(cost),
      sellingPrice: Number(sellingPrice),
      owner
    };

    saveProducts([...products, newProduct]);
    
    // Reset form
    setName('');
    setCost('');
    setSellingPrice('');
    setOwner('basim');
    
    // Refresh the page to show new product
    window.location.reload();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h3 className="text-lg font-semibold mb-4">Add New Product</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Product Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Enter product name"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="cost" className="block text-sm font-medium text-gray-700">
              Cost (SAR)
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
            />
          </div>

          <div>
            <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700">
              Selling Price (SAR)
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