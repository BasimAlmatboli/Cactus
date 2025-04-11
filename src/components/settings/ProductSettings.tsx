import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { getProducts, saveProducts } from '../../data/products';
import { Save } from 'lucide-react';
import { ProductForm } from './ProductForm';
import { ProductList } from './ProductList';
import { ProductImportExport } from './ProductImportExport';

export const ProductSettings = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setProducts(getProducts());
  }, []);

  const handleProductChange = (id: string, field: keyof Product, value: number | string) => {
    setProducts(products.map(product => 
      product.id === id ? { ...product, [field]: value } : product
    ));
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(product => product.id !== id));
    }
  };

  const handleSave = () => {
    saveProducts(products);
    alert('Changes saved successfully!');
  };

  const handleProductsImported = (importedProducts: Product[]) => {
    const updatedProducts = [...products, ...importedProducts];
    setProducts(updatedProducts);
    saveProducts(updatedProducts);
    alert('Products imported successfully!');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Product Settings</h2>
        <div className="flex gap-4">
          <ProductImportExport 
            products={products}
            onProductsImported={handleProductsImported}
          />
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      <ProductForm />
      
      <ProductList
        products={products}
        onProductChange={handleProductChange}
        onDeleteProduct={handleDeleteProduct}
      />
    </div>
  );
};