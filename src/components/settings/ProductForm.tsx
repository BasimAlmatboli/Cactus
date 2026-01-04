import React, { useState } from 'react';
import { Product } from '../../types';
import { saveProduct, generateUniqueSKU } from '../../data/products';
import { Plus, Loader2 } from 'lucide-react';

interface ProductFormProps {
  onProductAdded: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ onProductAdded }) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [cost, setCost] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [owner, setOwner] = useState<'yassir' | 'basim'>('basim');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !cost || !sellingPrice) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);

      // Generate SKU if not provided
      const finalSku = sku.trim() || await generateUniqueSKU(name);

      const newProduct: Product = {
        id: `product_${Date.now()}`,
        name,
        sku: finalSku,
        cost: Number(cost),
        sellingPrice: Number(sellingPrice),
        owner
      };

      await saveProduct(newProduct);

      // Reset form
      setName('');
      setSku('');
      setCost('');
      setSellingPrice('');
      setOwner('basim');

      // Notify parent to reload products
      onProductAdded();

      alert('Product added successfully!');
    } catch (error: any) {
      console.error('Error adding product:', error);
      if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
        alert('SKU already exists. Please use a different SKU.');
      } else {
        alert('Failed to add product. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNameChange = async (newName: string) => {
    setName(newName);
    // Auto-generate SKU if SKU field is empty
    if (!sku.trim() && newName.trim()) {
      try {
        const generatedSku = await generateUniqueSKU(newName);
        setSku(generatedSku);
      } catch (error) {
        console.error('Error generating SKU:', error);
      }
    }
  };

  return (
    <div className="bg-gray-900/50 rounded-lg shadow-md p-6 mb-8 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-200">Add New Product</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">
              Product Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-600 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-2 border bg-gray-700 text-white placeholder-gray-400"
              placeholder="Enter product name"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="sku" className="block text-sm font-medium text-gray-300">
              SKU (Stock Keeping Unit)
            </label>
            <input
              type="text"
              id="sku"
              value={sku}
              onChange={(e) => setSku(e.target.value.toUpperCase())}
              className="mt-1 block w-full rounded-md border-gray-600 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-2 border bg-gray-700 text-white placeholder-gray-400"
              placeholder="Auto-generated if empty"
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-gray-400">
              Leave empty to auto-generate from product name
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="cost" className="block text-sm font-medium text-gray-300">
              Cost (SAR) *
            </label>
            <input
              type="number"
              id="cost"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-600 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-2 border bg-gray-700 text-white placeholder-gray-400"
              placeholder="0.00"
              step="0.01"
              min="0"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-300">
              Selling Price (SAR) *
            </label>
            <input
              type="number"
              id="sellingPrice"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-600 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-2 border bg-gray-700 text-white placeholder-gray-400"
              placeholder="0.00"
              step="0.01"
              min="0"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <label htmlFor="owner" className="block text-sm font-medium text-gray-300">
            Product Owner
          </label>
          <select
            id="owner"
            value={owner}
            onChange={(e) => setOwner(e.target.value as 'yassir' | 'basim')}
            className="mt-1 block w-full rounded-md border-gray-600 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-2 border bg-gray-700 text-white"
            disabled={isSubmitting}
          >
            <option value="basim">Basim</option>
            <option value="yassir">Yassir</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Adding Product...</span>
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};