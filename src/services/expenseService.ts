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

  return expenses;
};

export const saveExpense = async (expense: Omit<Expense, 'id'>): Promise<void> => {
  const { error } = await supabase
    .from('expenses')
    .insert({
      ...expense,
      id: generateUUID()
    });

  if (error) {
    console.error('Error saving expense:', error);
    throw error;
  }
};

export const updateExpenseAmount = async (id: string, amount: number): Promise<void> => {
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  const { error } = await supabase
    .from('expenses')
    .update({ amount })
    .eq('id', id);

  if (error) {
    console.error('Error updating expense amount:', error);
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