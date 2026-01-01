import { OrderItem, AppliedOffer } from '../../types';
import { ProfitShare, ItemProfitDetails, TotalProfitShare } from './types';
import { calculateCachedProfitShare } from '../../services/profitShareService';
import {
  calculateItemRevenue,
  calculateTotalRevenue,
  calculateRevenueProportion
} from './revenue';
import {
  calculateItemExpenseShare,
  calculateItemCost
} from './expenses';

export const calculateItemProfit = async (
  item: OrderItem,
  totalSubtotal: number,
  shippingCost: number,
  paymentFees: number,
  manualDiscountAmount: number,
  appliedOffer: AppliedOffer | null,
  isFreeShipping: boolean
): Promise<ItemProfitDetails> => {
  const itemSubtotal = item.product.sellingPrice * item.quantity;
  const revenueProportion = calculateRevenueProportion(itemSubtotal, totalSubtotal);

  // Calculate total (only add shipping if it's not free)
  const shippingToAdd = isFreeShipping ? 0 : shippingCost;
  const total = itemSubtotal + (shippingToAdd * revenueProportion);

  // Calculate cost
  const cost = calculateItemCost(item.product.cost, item.quantity);

  // Calculate expense share (always include shipping cost in expenses even if free)
  // Separate shared expenses (distributed proportionally) from offer-specific discounts
  const sharedExpenses = shippingCost + paymentFees + manualDiscountAmount;
  let expenseShare = calculateItemExpenseShare(sharedExpenses, revenueProportion);

  // If this item is the target of an applied offer, add the offer discount to its expenses only
  if (appliedOffer && item.product.id === appliedOffer.targetProductId) {
    expenseShare += appliedOffer.discountAmount;
  }

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

export const calculateTotalProfitShare = async (
  items: OrderItem[],
  shippingCost: number,
  paymentFees: number,
  manualDiscountAmount: number,
  appliedOffer: AppliedOffer | null = null,
  isFreeShipping: boolean = false
): Promise<TotalProfitShare> => {
  const totalSubtotal = items.reduce(
    (sum, item) => sum + (item.product.sellingPrice * item.quantity),
    0
  );

  // Only add shipping to total if it's not free
  const totalWithShipping = totalSubtotal + (isFreeShipping ? 0 : shippingCost);

  const itemShares = await Promise.all(
    items.map(item =>
      calculateItemProfit(
        item,
        totalSubtotal,
        shippingCost,
        paymentFees,
        manualDiscountAmount,
        appliedOffer,
        isFreeShipping
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