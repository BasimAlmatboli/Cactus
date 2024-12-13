import React, { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { Order } from '../types';
import { exportOrdersToCSV, importOrdersFromCSV, downloadCSV } from '../utils/csvHelpers';

interface ImportExportButtonsProps {
  orders: Order[];
  onOrdersImported: (orders: Order[]) => void;
}

export const ImportExportButtons: React.FC<ImportExportButtonsProps> = ({
  orders,
  onOrdersImported,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const csv = exportOrdersToCSV(orders);
    const filename = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csv, filename);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedOrders = await importOrdersFromCSV(file);
      onOrdersImported(importedOrders);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error importing orders:', error);
      alert('Error importing orders. Please check the file format and try again.');
    }
  };

  return (
    <div className="flex gap-4">
      <button
        onClick={handleExport}
        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <Download className="h-4 w-4" />
        <span>Export CSV</span>
      </button>
      
      <label className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
        <Upload className="h-4 w-4" />
        <span>Import CSV</span>
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