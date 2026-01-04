import React, { useRef } from 'react';
import { Download, Upload, Loader2 } from 'lucide-react';
import { Expense } from '../../types/expense';
import { exportExpensesToCSV, importExpensesFromCSV, downloadCSV } from '../../utils/expenses/csvHelpers';

interface ExpenseImportExportProps {
  expenses: Expense[];
  onExpensesImported: () => Promise<void>;
}

export const ExpenseImportExport: React.FC<ExpenseImportExportProps> = ({
  expenses,
  onExpensesImported,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = React.useState(false);

  const handleExport = () => {
    const csv = exportExpensesToCSV(expenses);
    const filename = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csv, filename);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      await importExpensesFromCSV(file);
      await onExpensesImported();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      alert('Expenses imported successfully!');
    } catch (error) {
      console.error('Error importing expenses:', error);
      alert(error instanceof Error ? error.message : 'Error importing expenses. Please check the file format and try again.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="flex gap-4">
      <button
        onClick={handleExport}
        className="flex items-center space-x-2 px-6 py-2.5 bg-green-600/90 text-white font-medium rounded-xl hover:bg-green-500 hover:shadow-lg hover:shadow-green-900/20 hover:-translate-y-0.5 transition-all"
      >
        <Download className="h-4 w-4" />
        <span>Export CSV</span>
      </button>

      <label className={`flex items-center space-x-2 px-6 py-2.5 ${isImporting
          ? 'bg-blue-600/50 text-blue-200 cursor-not-allowed shadow-none'
          : 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-900/20 hover:-translate-y-0.5'
        } font-medium rounded-xl transition-all cursor-pointer`}>
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