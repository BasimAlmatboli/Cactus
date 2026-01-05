/**
 * Calculate Item's Proportional Expense Share
 * 
 * Distributes total order expenses (shipping, fees, discount) proportionally
 * to each item based on its revenue contribution.
 * 
 * Formula: totalExpenses × revenueProportion
 * 
 * Example:
 * Total Order Expenses: 20 SAR (15 shipping + 3 fees + 2 discount)
 * Item Revenue Proportion: 0.7 (item represents 70% of order value)
 * Result: 14 SAR (this item bears 70% of total expenses)
 * 
 * @param totalExpenses - Total order expenses (shipping + fees + discount)
 * @param revenueProportion - Item's proportion of total revenue (0-1)
 * @returns Expense amount this item should bear
 */
export const calculateItemExpenseShare = (
  totalExpenses: number,
  revenueProportion: number
): number => {
  return totalExpenses * revenueProportion;
};

/**
 * Calculate Item Cost (Total Purchase Cost)
 * 
 * Formula: costPrice × quantity
 * 
 * Example:
 * Cost per unit: 19 SAR
 * Quantity: 2
 * Result: 38 SAR (total cost for this item)
 * 
 * @param costPrice - Cost per unit (what you paid)
 * @param quantity - Number of units
 * @returns Total cost for this item
 */
export const calculateItemCost = (costPrice: number, quantity: number): number => {
  return costPrice * quantity;
};