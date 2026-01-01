import { OrderItem } from '../types';
import { calculateCachedProfitShare } from '../services/profitShareService';

/**
 * Profit Sharing Calculator
 * 
 * This module implements the profit sharing calculation logic using database-stored percentages.
 * 
 * The calculation follows these steps:
 * 
 * 1. Calculate Total Revenue
 * 2. For Each Product:
 *    a. Calculate Item Revenue
 *    b. Calculate Revenue Proportion
 *    c. Calculate Item's Share of Expenses
 *    d. Calculate Item's Cost
 *    e. Calculate Net Profit
 * 3. Apply Profit Sharing Percentages (from database)
 */

export interface ProfitShare {
  yassirShare: number;
  basimShare: number;
}

export async function calculateItemProfitShare(
  item: OrderItem,
  totalRevenue: number,
  totalExpenses: number
): Promise<ProfitShare & {
  revenue: number;
  revenueProportion: number;
  expenseShare: number;
  cost: number;
  netProfit: number;
}> {
  // Step 2a: Calculate Item Revenue
  const revenue = item.product.sellingPrice * item.quantity;

  // Step 2b: Calculate Revenue Proportion
  const revenueProportion = revenue / totalRevenue;

  // Step 2c: Calculate Expense Share
  const expenseShare = totalExpenses * revenueProportion;

  // Step 2d: Calculate Cost
  const cost = item.product.cost * item.quantity;

  // Step 2e: Calculate Net Profit
  const netProfit = revenue - cost - expenseShare;

  // Step 3: Apply Profit Sharing Percentages from database
  const shares = await calculateCachedProfitShare(item.product.id, netProfit);

  return {
    revenue,
    revenueProportion,
    expenseShare,
    cost,
    netProfit,
    yassirShare: shares.yassir,
    basimShare: shares.basim
  };
}

export async function calculateTotalProfitShare(
  items: OrderItem[],
  totalExpenses: number
): Promise<{
  totalRevenue: number;
  itemShares: Array<Awaited<ReturnType<typeof calculateItemProfitShare>>>;
  totalYassirShare: number;
  totalBasimShare: number;
}> {
  // Step 1: Calculate Total Revenue
  const totalRevenue = items.reduce(
    (sum, item) => sum + (item.product.sellingPrice * item.quantity),
    0
  );

  // Step 2 & 3: Calculate Individual Item Shares
  const itemShares = await Promise.all(
    items.map(item => calculateItemProfitShare(item, totalRevenue, totalExpenses))
  );

  // Calculate Totals
  const totalYassirShare = itemShares.reduce(
    (sum, share) => sum + share.yassirShare,
    0
  );

  const totalBasimShare = itemShares.reduce(
    (sum, share) => sum + share.basimShare,
    0
  );

  return {
    totalRevenue,
    itemShares,
    totalYassirShare,
    totalBasimShare
  };
}