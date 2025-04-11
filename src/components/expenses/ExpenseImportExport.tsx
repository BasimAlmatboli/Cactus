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