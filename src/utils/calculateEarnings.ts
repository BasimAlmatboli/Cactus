import { OrderItem } from '../types';

interface TotalEarnings {
  yassirProductsCost: number;
  basimProductsCost: number;
  yassirTotalEarnings: number;
  basimTotalEarnings: number;
  combinedTotalEarnings: number;
}

export const calculateTotalEarnings = (
  items: OrderItem[],
  yassirShare: number,
  basimShare: number
): TotalEarnings => {
  // Calculate products cost for each owner
  const { yassirCost, basimCost } = items.reduce(
    (acc, item) => {
      const itemTotalCost = item.product.cost * item.quantity;
      // Assign cost based on product ownership
      if (item.product.owner === 'yassir') {
        acc.yassirCost += itemTotalCost;
      } else if (item.product.owner === 'basim') {
        acc.basimCost += itemTotalCost;
      }
      return acc;
    },
    { yassirCost: 0, basimCost: 0 }
  );

  // Calculate total earnings by adding profit share and respective product costs
  const yassirTotalEarnings = yassirShare + yassirCost;
  const basimTotalEarnings = basimShare + basimCost;
  const combinedTotalEarnings = yassirTotalEarnings + basimTotalEarnings;

  return {
    yassirProductsCost: yassirCost,
    basimProductsCost: basimCost,
    yassirTotalEarnings,
    basimTotalEarnings,
    combinedTotalEarnings,
  };
};