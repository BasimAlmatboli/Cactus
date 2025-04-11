import React from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { Order } from '../../types';
import { generateReportsPDF } from '../../utils/pdf/generateReportsPDF';

interface ExportReportsButtonProps {
  orders: Order[];
  reportsContainerRef: React.RefObject<HTMLDivElement>;
}

export const ExportReportsButton: React.FC<ExportReportsButtonProps> = ({
  orders,
  reportsContainerRef,
}) => {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = async () => {
    if (!reportsContainerRef.current) return;

    try {
      setIsExporting(true);
      await generateReportsPDF(reportsContainerRef.current, orders);
    } catch (error) {
      console.error('Error exporting reports:', error);
      alert('Failed to export reports. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`flex items-center space-x-2 px-4 py-2 ${
        isExporting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
      } text-white rounded-lg transition-colors`}
    >
      {isExporting ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Generating PDF...</span>
        </>
      ) : (
        <>
          <FileDown className="h-5 w-5" />
          <span>Export PDF</span>
        </>
      )}
    </button>
  );
};