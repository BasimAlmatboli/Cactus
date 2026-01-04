import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { getProducts, saveProduct, deleteProduct } from '../../data/products';
import { Loader2 } from 'lucide-react';
import { ProductForm } from './ProductForm';
import { ProductList } from './ProductList';
import { ProductImportExport } from './ProductImportExport';

export const ProductSettings = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedProducts = await getProducts();
      setProducts(loadedProducts);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductChange = async (id: string, field: keyof Product, value: number | string) => {
    try {
      // Update local state immediately for better UX
      const updatedProducts = products.map(product =>
        product.id === id ? { ...product, [field]: value } : product
      );
      setProducts(updatedProducts);

      // Save to database
      const productToUpdate = updatedProducts.find(p => p.id === id);
      if (productToUpdate) {
        await saveProduct(productToUpdate);
      }
    } catch (err) {
      console.error('Error updating product:', err);
      alert('Failed to update product. Please try again.');
      // Reload products to revert changes
      await loadProducts();
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setIsSaving(true);
        await deleteProduct(id);
        // Update local state
        setProducts(products.filter(product => product.id !== id));
        alert('Product deleted successfully!');
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Failed to delete product. Please try again.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleProductAdded = async () => {
    // Reload products after adding a new one
    await loadProducts();
  };

  const handleProductsImported = async (importedProducts: Product[]) => {
    try {
      setIsSaving(true);
      // Save each imported product to database
      for (const product of importedProducts) {
        await saveProduct(product);
      }
      // Reload all products
      await loadProducts();
      alert('Products imported successfully!');
    } catch (err) {
      console.error('Error importing products:', err);
      alert('Failed to import products. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Product Settings</h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          <span className="ml-2 text-gray-300">Loading products...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Product Settings</h2>
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-300">
          {error}
          <button
            onClick={loadProducts}
            className="ml-4 text-red-200 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Product Settings</h2>
        <div className="flex gap-4">
          <ProductImportExport
            products={products}
            onProductsImported={handleProductsImported}
          />
        </div>
      </div>

      <ProductForm onProductAdded={handleProductAdded} />

      <ProductList
        products={products}
        onProductChange={handleProductChange}
        onDeleteProduct={handleDeleteProduct}
        isSaving={isSaving}
      />
    </div>
  );
};