import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { Order } from '../types';
import { exportOrdersToCSV, downloadCSV } from '../utils/csv/csvHelpers';

interface ImportExportButtonsProps {
  orders: Order[];
}

export const ImportExportButtons: React.FC<ImportExportButtonsProps> = ({ orders }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const csv = await exportOrdersToCSV(orders);
      const filename = `orders-${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(csv, filename);
    } catch (error) {
      console.error('Error exporting orders:', error);
      alert('Error exporting orders. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting || orders.length === 0}
      className={`flex items-center space-x-2 px-4 py-2 ${isExporting || orders.length === 0
          ? 'bg-green-400 cursor-not-allowed'
          : 'bg-green-600 hover:bg-green-700'
        } text-white rounded-lg transition-colors`}
    >
      <Download className="h-4 w-4" />
      <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
    </button>
  );
};