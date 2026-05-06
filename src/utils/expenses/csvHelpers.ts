import { Expense } from '../../types/expense';
import { supabase } from '../../lib/supabase';
import { generateUUID } from '../uuid';

export const exportExpensesToCSV = (expenses: Expense[]): string => {
  const headers = [
    'Date',
    'Category',
    'Description',
    'Amount',
    'Basim Share %',
    'Yassir Share %',
    'Include Tax',
    'Is Reimbursement'
  ].join(',');

  const rows = expenses.map(expense => [
    expense.date,
    expense.category,
    `"${expense.description.replace(/"/g, '""')}"`,
    expense.amount,
    expense.basimSharePercentage,
    expense.yassirSharePercentage,
    expense.includeTax ? 'true' : 'false',
    expense.isReimbursement ? 'true' : 'false'
  ].join(','));

  return [headers, ...rows].join('\n');
};

export const importExpensesFromCSV = async (file: File): Promise<void> => {
  const text = await file.text();
  const lines = text.split('\n');
  const rows = lines.slice(1); // skip header

  for (const row of rows) {
    if (!row.trim()) continue;

    const values = parseCSVRow(row);
    const getValue = (index: number) => values[index]?.replace(/"/g, '').trim() || '';

    try {
      const date = getValue(0);
      const category = getValue(1) as Expense['category'];
      const description = getValue(2);
      const amount = parseFloat(getValue(3));
      const basimSharePercentage = parseFloat(getValue(4)) || 50;
      const yassirSharePercentage = parseFloat(getValue(5)) || 50;
      const includeTax = getValue(6).toLowerCase() === 'true';
      const isReimbursement = getValue(7).toLowerCase() === 'true';

      // Validate category
      if (!['marketing', 'packaging', 'subscription', 'other'].includes(category)) {
        throw new Error(`Invalid category: ${category}`);
      }

      // Validate amount
      if (isNaN(amount)) {
        throw new Error(`Invalid amount: ${getValue(3)}`);
      }

      // Auto-determine owner
      const owner: Expense['owner'] =
        basimSharePercentage === yassirSharePercentage ? 'shared' :
          basimSharePercentage > yassirSharePercentage ? 'basim' : 'yassir';

      const { error } = await supabase
        .from('expenses')
        .insert({
          id: generateUUID(),
          date,
          category,
          description,
          amount,
          owner,
          basim_share_percentage: basimSharePercentage,
          yassir_share_percentage: yassirSharePercentage,
          include_tax: includeTax,
          is_reimbursement: isReimbursement
        } as any);

      if (error) {
        throw new Error(`Failed to import expense: ${error.message}`);
      }
    } catch (error) {
      console.error('Error processing row:', error);
      throw new Error(`Failed to process row: ${(error as Error).message}`);
    }
  }
};

const parseCSVRow = (row: string): string[] => {
  const values: string[] = [];
  let currentValue = '';
  let insideQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      values.push(currentValue.trim());
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  values.push(currentValue.trim());
  return values;
};

export const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};