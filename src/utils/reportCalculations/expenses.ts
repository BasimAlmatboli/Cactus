import { Expense } from '../../types/expense';
import { PartnerExpenses } from './types';

/**
 * Calculate Total Operating Expenses
 *
 * Sum of all manually entered expenses (marketing, packaging, etc.)
 * EXCLUDES reimbursements — those are not operating expenses, they are
 * personal advances that get added back to the partner's distribution.
 *
 * @param expenses - Array of expenses
 * @returns Total operating expense amount (no reimbursements)
 *
 * @example
 * const total = calculateTotalExpenses(expenses); // 3000 SAR
 */
export function calculateTotalExpenses(expenses: Expense[]): number {
    return expenses
        .filter(e => !e.isReimbursement)
        .reduce((sum, expense) => sum + expense.amount, 0);
}

/**
 * Calculate Expenses by Partner
 *
 * Splits regular (non-reimbursement) expenses based on partner share percentages.
 * Also calculates reimbursements per partner separately.
 *
 * Regular expenses → DEDUCTED from partner distribution
 * Reimbursements   → ADDED to partner distribution (they paid from own pocket)
 *
 * @param expenses - Array of expenses
 * @returns Partner expense + reimbursement breakdown
 *
 * @example
 * const breakdown = calculateExpensesByPartner(expenses);
 * // {
 * //   yassirExpenses: 1800, basimExpenses: 1200, totalExpenses: 3000,
 * //   yassirReimbursements: 500, basimReimbursements: 0, totalReimbursements: 500
 * // }
 */
export function calculateExpensesByPartner(expenses: Expense[]): PartnerExpenses {
    // Regular expenses (non-reimbursement) — deducted from distribution
    const regularExpenses = expenses.filter(e => !e.isReimbursement);
    const reimbursements = expenses.filter(e => e.isReimbursement);

    const yassirExpenses = regularExpenses.reduce((sum, expense) => {
        return sum + (expense.amount * (expense.yassirSharePercentage / 100));
    }, 0);

    const basimExpenses = regularExpenses.reduce((sum, expense) => {
        return sum + (expense.amount * (expense.basimSharePercentage / 100));
    }, 0);

    const totalExpenses = regularExpenses.reduce((sum, expense) => {
        return sum + expense.amount;
    }, 0);

    // Reimbursements — added back to whichever partner paid
    const yassirReimbursements = reimbursements.reduce((sum, expense) => {
        return sum + (expense.amount * (expense.yassirSharePercentage / 100));
    }, 0);

    const basimReimbursements = reimbursements.reduce((sum, expense) => {
        return sum + (expense.amount * (expense.basimSharePercentage / 100));
    }, 0);

    const totalReimbursements = reimbursements.reduce((sum, expense) => {
        return sum + expense.amount;
    }, 0);

    return {
        yassirExpenses,
        basimExpenses,
        totalExpenses,
        yassirReimbursements,
        basimReimbursements,
        totalReimbursements
    };
}

/**
 * Calculate Marketing Expenses
 *
 * Sum of expenses with category 'marketing' (excludes reimbursements)
 *
 * @param expenses - Array of expenses
 * @returns Total marketing expenses
 *
 * @example
 * const marketing = calculateMarketingExpenses(expenses); // 2500 SAR
 */
export function calculateMarketingExpenses(expenses: Expense[]): number {
    return expenses
        .filter(e => e.category === 'marketing' && !e.isReimbursement)
        .reduce((sum, e) => sum + e.amount, 0);
}
