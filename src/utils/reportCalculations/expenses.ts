import { Expense } from '../../types/expense';
import { PartnerExpenses } from './types';

/**
 * Calculate Total Operating Expenses
 * 
 * Sum of all manually entered expenses (marketing, packaging, etc.)
 * 
 * @param expenses - Array of expenses
 * @returns Total expense amount
 * 
 * @example
 * const total = calculateTotalExpenses(expenses); // 3000 SAR
 */
export function calculateTotalExpenses(expenses: Expense[]): number {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

/**
 * Calculate Expenses by Partner
 * 
 * Splits expenses based on partner share percentages
 * 
 * @param expenses - Array of expenses
 * @returns Partner expense breakdown
 * 
 * @example
 * const breakdown = calculateExpensesByPartner(expenses);
 * // { yassirExpenses: 1800, basimExpenses: 1200, totalExpenses: 3000 }
 */
export function calculateExpensesByPartner(expenses: Expense[]): PartnerExpenses {
    const yassirExpenses = expenses.reduce((sum, expense) => {
        return sum + (expense.amount * (expense.yassirSharePercentage / 100));
    }, 0);

    const basimExpenses = expenses.reduce((sum, expense) => {
        return sum + (expense.amount * (expense.basimSharePercentage / 100));
    }, 0);

    const totalExpenses = expenses.reduce((sum, expense) => {
        return sum + expense.amount;
    }, 0);

    return {
        yassirExpenses,
        basimExpenses,
        totalExpenses
    };
}

/**
 * Calculate Marketing Expenses
 * 
 * Sum of expenses with category 'marketing'
 * 
 * @param expenses - Array of expenses
 * @returns Total marketing expenses
 * 
 * @example
 * const marketing = calculateMarketingExpenses(expenses); // 2500 SAR
 */
export function calculateMarketingExpenses(expenses: Expense[]): number {
    return expenses
        .filter(e => e.category === 'marketing')
        .reduce((sum, e) => sum + e.amount, 0);
}
