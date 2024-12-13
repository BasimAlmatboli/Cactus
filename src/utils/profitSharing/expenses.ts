/**
 * Calculate expense-related metrics
 */
export const calculateItemExpenseShare = (
  totalExpenses: number,
  revenueProportion: number
): number => {
  return totalExpenses * revenueProportion;
};

export const calculateItemCost = (costPrice: number, quantity: number): number => {
  return costPrice * quantity;
};