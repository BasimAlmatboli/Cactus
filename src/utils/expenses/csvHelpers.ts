import { Expense } from '../../types/expense';
import { supabase } from '../../lib/supabase';
import { generateUUID } from '../uuid';

export const exportExpensesToCSV = (expenses: Expense[]): string => {
  const headers = [
    'Date',
    'Category',
    'Description',
    'Amount'
  ].join(',');

  const rows = expenses.map(expense => [
    expense.date,
    expense.category,
    `"${expense.description.replace(/"/g, '""')}"`,
    expense.amount
  ].join(','));

  return [headers, ...rows].join('\n');
};

export const importExpensesFromCSV = async (file: File): Promise<void> => {
  const text = await file.text();
  const lines = text.split('\n');
  const headers = lines[0].split(',');
  const rows = lines.slice(1);

  for (const row of rows) {
    if (!row.trim()) continue;

    const values = parseCSVRow(row);
    const getValue = (index: number) => values[index]?.replace(/"/g, '').trim() || '';

    try {
      const expense = {
        id: generateUUID(),
        date: getValue(0),
        category: getValue(1) as Expense['category'],
        description: getValue(2),
        amount: parseFloat(getValue(3))
      };

      // Validate category
      if (!['marketing', 'packaging', 'subscription', 'other'].includes(expense.category)) {
        throw new Error(`Invalid category: ${expense.category}`);
      }

      // Validate amount
      if (isNaN(expense.amount)) {
        throw new Error(`Invalid amount: ${getValue(3)}`);
      }

      const { error } = await supabase
        .from('expenses')
        .insert(expense);

      if (error) {
        throw new Error(`Failed to import expense: ${error.message}`);
      }
    } catch (error) {
      console.error('Error processing row:', error);
      throw new Error(`Failed to process row: ${error.message}`);
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