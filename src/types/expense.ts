export interface Expense {
  id: string;
  date: string;
  category: 'marketing' | 'packaging' | 'subscription' | 'other';
  description: string;
  amount: number;
  owner: 'basim' | 'yassir' | 'shared';
}

export interface ExpenseCategory {
  id: 'marketing' | 'packaging' | 'subscription' | 'other';
  name: string;
  icon: string; // Lucide icon name
}