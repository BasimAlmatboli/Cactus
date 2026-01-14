export interface Expense {
  id: string;
  date: string;
  category: 'marketing' | 'packaging' | 'subscription' | 'other';
  description: string;
  amount: number;
  owner: 'basim' | 'yassir' | 'shared';
  basimSharePercentage: number; // Basim's ownership percentage (0-100)
  yassirSharePercentage: number; // Yasir's ownership percentage (0-100)
  includeTax: boolean; // Whether 15% VAT is included in amount
  amountBeforeTax?: number; // Original amount before tax (if tax is included)
}

export interface ExpenseCategory {
  id: 'marketing' | 'packaging' | 'subscription' | 'other';
  name: string;
  icon: string; // Lucide icon name
}