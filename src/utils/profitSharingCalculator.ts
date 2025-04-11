import { OrderItem } from '../types';

/**
 * Profit Sharing Calculator
 * 
 * This module documents and implements the profit sharing calculation logic.
 * 
 * The calculation follows these steps:
 * 
 * 1. Calculate Total Revenue
 *    - Sum of (selling price × quantity) for all items
 *    Example: 
 *      Item A: 199 SAR × 2 = 398 SAR
 *      Item B: 79 SAR × 1 = 79 SAR
 *      Total Revenue = 477 SAR
 * 
 * 2. For Each Product:
 *    a. Calculate Item Revenue
 *       - selling price × quantity
 *       Example: 199 SAR × 2 = 398 SAR
 * 
 *    b. Calculate Revenue Proportion
 *       - item revenue ÷ total revenue
 *       Example: 398 ÷ 477 = 0.834 (83.4%)
 * 
 *    c. Calculate Item's Share of Expenses
 *       - (shipping cost + payment fees) × revenue proportion
 *       Example: If total expenses are 30 SAR
 *       Item's expense share = 30 × 0.834 = 25.02 SAR
 * 
 *    d. Calculate Item's Cost
 *       - cost price × quantity
 *       Example: 130 SAR × 2 = 260 SAR
 * 
 *    e. Calculate Net Profit
 *       - (revenue - cost - expense share)
 *       Example: 398 - 260 - 25.02 = 112.98 SAR
 * 
 * 3. Apply Profit Sharing Percentages:
 *    Different products have different sharing ratios:
 *    - Lines RGB Light: Yassir 90% / Basim 10%
 *    - Mousepad: Yassir 70% / Basim 30%
 *    - Smart Cube: Yassir 0% / Basim 100%
 *    - Others: Yassir 0% / Basim 100%
 * 
 *    Example for RGB Light:
 *    Net Profit = 112.98 SAR
 *    Yassir's Share = 112.98 × 0.9 = 101.68 SAR
 *    Basim's Share = 112.98 × 0.1 = 11.30 SAR
 */

export interface ProfitShare {
  yassirShare: number;
  basimShare: number;
}

export function calculateItemProfitShare(
  item: OrderItem,
  totalRevenue: number,
  totalExpenses: number
): ProfitShare & { 
  revenue: number;
  revenueProportion: number;
  expenseShare: number;
  cost: number;
  netProfit: number;
} {
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
  
  // Step 3: Apply Profit Sharing Percentages
  let yassirPercentage = 0;
  switch (item.product.name) {
    case 'Lines RGB Light':
      yassirPercentage = 0.9; // 90%
      break;
    case 'Mousepad':
      yassirPercentage = 0.7; // 70%
      break;
    default:
      yassirPercentage = 0; // 0%
  }
  
  const yassirShare = netProfit * yassirPercentage;
  const basimShare = netProfit * (1 - yassirPercentage);
  
  return {
    revenue,
    revenueProportion,
    expenseShare,
    cost,
    netProfit,
    yassirShare,
    basimShare
  };
}

export function calculateTotalProfitShare(
  items: OrderItem[],
  totalExpenses: number
): {
  totalRevenue: number;
  itemShares: Array<ReturnType<typeof calculateItemProfitShare>>;
  totalYassirShare: number;
  totalBasimShare: number;
} {
  // Step 1: Calculate Total Revenue
  const totalRevenue = items.reduce(
    (sum, item) => sum + (item.product.sellingPrice * item.quantity),
    0
  );
  
  // Step 2 & 3: Calculate Individual Item Shares
  const itemShares = items.map(item => 
    calculateItemProfitShare(item, totalRevenue, totalExpenses)
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