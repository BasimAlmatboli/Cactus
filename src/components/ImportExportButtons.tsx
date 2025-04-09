import React, { useRef, useState } from 'react';
import { Download, Upload, Loader2 } from 'lucide-react';
import { Order } from '../types';
import { exportOrdersToCSV, importOrdersFromCSV, downloadCSV } from '../utils/csv/csvHelpers';

interface ImportExportButtonsProps {
  orders: Order[];
  onOrdersImported: () => Promise<void>;
}

export const ImportExportButtons: React.FC<ImportExportButtonsProps> = ({
  orders,
  onOrdersImported,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = () => {
    const csv = exportOrdersToCSV(orders);
    const filename = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csv, filename);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      await importOrdersFromCSV(file);
      await onOrdersImported();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      alert('Orders imported successfully!');
    } catch (error) {
      console.error('Error importing orders:', error);
      alert(error instanceof Error ? error.message : 'Error importing orders. Please check the file format and try again.');
    } finally {
      setIsImporting(false);
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
      
      <label className={`flex items-center space-x-2 px-4 py-2 ${
        isImporting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
      } text-white rounded-lg transition-colors cursor-pointer`}>
        {isImporting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Importing...</span>
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            <span>Import CSV</span>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleImport}
          disabled={isImporting}
          className="hidden"
        />
      </label>
    </div>
  );
};