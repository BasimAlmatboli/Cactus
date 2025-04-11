import React, { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { Product } from '../../types';
import { exportProductsToCSV, importProductsFromCSV, downloadCSV } from '../../utils/productCsvHelpers';

interface ProductImportExportProps {
  products: Product[];
  onProductsImported: (products: Product[]) => void;
}

export const ProductImportExport: React.FC<ProductImportExportProps> = ({
  products,
  onProductsImported,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const csv = exportProductsToCSV(products);
    const filename = `products-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csv, filename);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedProducts = await importProductsFromCSV(file);
      onProductsImported(importedProducts);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error importing products:', error);
      alert('Error importing products. Please check the file format and try again.');
    }
  };

  return (
    <div className="flex gap-4">
      <button
        onClick={handleExport}
        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <Download className="h-4 w-4" />
        <span>Export Products</span>
      </button>
      
      <label className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
        <Upload className="h-4 w-4" />
        <span>Import Products</span>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleImport}
          className="hidden"
        />
      </label>
    </div>
  );
};