import { OrderItem } from '../../types';
import { ItemProfitDetails, TotalProfitShare } from './types';
import { calculateCachedProfitShare } from '../../services/profitShareService';
import {
  calculateRevenueProportion
} from './revenue';
import {
  calculateItemExpenseShare,
  calculateItemCost
} from './expenses';

/**
 * Calculate Item Profit Details
 * 
 * Calculates complete profit breakdown for a single item, including:
 * - Revenue (with proportional shipping)
 * - Expenses (proportional fees/discount)
 * - Cost
 * - Net profit
 * - Partner shares (Yassir & Basim)
 * 
 * Formula Breakdown:
 * 1. Item Subtotal = sellingPrice × quantity
 * 2. Revenue Proportion = itemSubtotal / totalSubtotal
 * 3. Total = itemSubtotal + (proportional shipping if not free)
 * 4. Cost = costPrice × quantity
 * 5. Expense Share = (shipping + fees + discount) × proportion
 * 6. Net Profit = total - cost - expenses
 * 7. Partner Shares = from database profit_shares table
 * 
 * Example:
 * Item: Mousepad, 50 SAR × 2 = 100 SAR
 * Total Order Subtotal: 150 SAR
 * Revenue Proportion: 100/150 = 0.667 (66.7%)
 * 
 * Shipping: 15 SAR (not free)
 * Proportional Shipping: 15 × 0.667 = 10 SAR
 * Total: 100 + 10 = 110 SAR
 * 
 * Cost: 19 SAR × 2 = 38 SAR
 * 
 * Expenses (20 SAR total):
 * - Shipping: 15 SAR
 * - Payment Fees: 3 SAR
 * - Discount: 2 SAR
 * Proportional Expenses: 20 × 0.667 = 13.33 SAR
 * 
 * Net Profit: 110 - 38 - 13.33 = 58.67 SAR
 * 
 * Partner Shares (from database):
 * - Yassir: 70% = 41.07 SAR
 * - Basim: 30% = 17.60 SAR
 * 
 * @param item - Order item with product details
 * @param totalSubtotal - Total subtotal of all items
 * @param shippingCost - Shipping cost (original, not actual)
 * @param paymentFees - Payment gateway fees
 * @param manualDiscountAmount - Discount amount applied
 * @param isFreeShipping - Whether free shipping was applied
 * @returns Complete profit breakdown for this item
 */
export const calculateItemProfit = async (
  item: OrderItem,
  totalSubtotal: number,
  shippingCost: number,
  paymentFees: number,
  manualDiscountAmount: number,
  isFreeShipping: boolean,
  customerFee: number = 0
): Promise<ItemProfitDetails> => {
  const itemSubtotal = item.product.sellingPrice * item.quantity;
  const revenueProportion = calculateRevenueProportion(itemSubtotal, totalSubtotal);

  // Calculate total (only add shipping if it's not free)
  const shippingToAdd = isFreeShipping ? 0 : shippingCost;
  const total = itemSubtotal + (shippingToAdd * revenueProportion) + (customerFee * revenueProportion);

  // Calculate cost
  const cost = calculateItemCost(item.product.cost, item.quantity);

  // Calculate expense share
  const expenseShare = calculateItemExpenseShare(shippingCost + paymentFees + manualDiscountAmount, revenueProportion);

  // Calculate net profit
  const netProfit = total - cost - expenseShare;

  // Calculate shares from database
  const shares = await calculateCachedProfitShare(item.product.id, netProfit);

  return {
    total,
    revenueProportion,
    expenseShare,
    cost,
    netProfit,
    yassirShare: shares.yassir,
    basimShare: shares.basim
  };
};

/**
 * Calculate Total Profit Share (Main Orchestrator)
 * 
 * Calculates complete profit breakdown for entire order across all items.
 * This is the MAIN profit calculation function used by the system.
 * 
 * Process:
 * 1. Calculate profit for each item (via calculateItemProfit)
 * 2. Sum partner shares across all items
 * 3. Return complete breakdown
 * 
 * Example Order:
 * Item A: Mousepad, 50 SAR × 2 = 100 SAR (cost: 19 SAR each)
 * Item B: RGB Light, 30 SAR × 1 = 30 SAR (cost: 10 SAR)
 * Subtotal: 130 SAR
 * Shipping: 15 SAR
 * Payment Fees: 3 SAR
 * Discount: 0 SAR
 * Free Shipping: No
 * 
 * Total with Shipping: 145 SAR
 * 
 * Item A Profit:
 * - Revenue: 100 + (15 × 0.77) = 111.54 SAR
 * - Cost: 38 SAR
 * - Expenses: 13.85 SAR
 * - Net Profit: 59.69 SAR
 * - Yassir (70%): 41.78 SAR
 * - Basim (30%): 17.91 SAR
 * 
 * Item B Profit:
 * - Revenue: 30 + (15 × 0.23) = 33.46 SAR
 * - Cost: 10 SAR
 * - Expenses: 4.15 SAR
 * - Net Profit: 19.31 SAR
 * - Yassir (90%): 17.38 SAR
 * - Basim (10%): 1.93 SAR
 * 
 * Total Shares:
 * - Yassir: 41.78 + 17.38 = 59.16 SAR
 * - Basim: 17.91 + 1.93 = 19.84 SAR
 * - Total: 79 SAR
 * 
 * @param items - All items in the order
 * @param shippingCost - Original shipping cost
 * @param paymentFees - Payment gateway fees
 * @param manualDiscountAmount - Discount applied to order
 * @param isFreeShipping - Whether free shipping was applied (default: false)
 * @returns Complete profit breakdown with all item details and partner totals
 */
export const calculateTotalProfitShare = async (
  items: OrderItem[],
  shippingCost: number,
  paymentFees: number,
  manualDiscountAmount: number,
  isFreeShipping: boolean = false,
  customerFee: number = 0
): Promise<TotalProfitShare> => {
  const totalSubtotal = items.reduce(
    (sum, item) => sum + (item.product.sellingPrice * item.quantity),
    0
  );

  // Only add shipping and customer fee to total if shipping is not free
  const totalWithShipping = totalSubtotal + (isFreeShipping ? 0 : shippingCost) + customerFee;

  const itemShares = await Promise.all(
    items.map(item =>
      calculateItemProfit(
        item,
        totalSubtotal,
        shippingCost,
        paymentFees,
        manualDiscountAmount,
        isFreeShipping,
        customerFee
      )
    )
  );

  const totalYassirShare = itemShares.reduce(
    (sum, share) => sum + share.yassirShare,
    0
  );

  const totalBasimShare = itemShares.reduce(
    (sum, share) => sum + share.basimShare,
    0
  );

  return {
    totalWithShipping,
    itemShares,
    totalYassirShare,
    totalBasimShare
  };
};