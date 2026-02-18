import React from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { generateReportsPDF } from '../../utils/pdf/generateReportsPDF';

interface ExportReportsButtonProps {
  sectionRefs: React.RefObject<HTMLDivElement>[];
}

export const ExportReportsButton: React.FC<ExportReportsButtonProps> = ({
  sectionRefs,
}) => {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = async () => {
    // Collect specific registered containers
    const containers = sectionRefs
      .map((ref) => ref.current)
      .filter((el): el is HTMLDivElement => el !== null);

    if (containers.length === 0) {
      console.warn('No report sections found to export.');
      return;
    }

    try {
      setIsExporting(true);
      await generateReportsPDF(containers);
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
      className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl transition-all shadow-lg font-medium ${isExporting
        ? 'bg-blue-600/50 text-blue-200 cursor-not-allowed shadow-none'
        : 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-blue-600/20 hover:-translate-y-0.5'
        }`}
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