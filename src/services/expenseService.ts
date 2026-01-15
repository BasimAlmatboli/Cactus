import { Expense } from '../types/expense';
import { supabase } from '../lib/supabase';
import { generateUUID } from '../utils/uuid';

export const getExpenses = async (): Promise<Expense[]> => {
  const { data: expenses, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error loading expenses:', error);
    throw error;
  }

  // Map snake_case from database to camelCase for TypeScript
  return expenses.map((exp: any) => ({
    id: exp.id,
    date: exp.date,
    category: exp.category,
    description: exp.description,
    amount: exp.amount,
    owner: exp.owner,
    basimSharePercentage: exp.basim_share_percentage ?? 50,
    yassirSharePercentage: exp.yassir_share_percentage ?? 50,
    includeTax: exp.include_tax ?? false,
    amountBeforeTax: exp.amount_before_tax
  }));
};

export const saveExpense = async (expense: Omit<Expense, 'id'>): Promise<void> => {
  const { error } = await supabase
    .from('expenses')
    .insert({
      id: generateUUID(),
      date: expense.date,
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      owner: expense.owner,
      basim_share_percentage: expense.basimSharePercentage,
      yassir_share_percentage: expense.yassirSharePercentage,
      include_tax: expense.includeTax,
      amount_before_tax: expense.amountBeforeTax
    } as any); // Type assertion until Supabase types are regenerated

  if (error) {
    console.error('Error saving expense:', error);
    throw error;
  }
};

export const updateExpense = async (id: string, expense: Omit<Expense, 'id'>): Promise<void> => {
  const updateData = {
    date: expense.date,
    category: expense.category,
    description: expense.description,
    amount: expense.amount,
    owner: expense.owner,
    basim_share_percentage: expense.basimSharePercentage,
    yassir_share_percentage: expense.yassirSharePercentage,
    include_tax: expense.includeTax,
    amount_before_tax: expense.amountBeforeTax
  };

  const { error } = await supabase
    .from('expenses')
    // @ts-ignore - Supabase types need to be regenerated after schema changes
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};

export const deleteExpense = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};