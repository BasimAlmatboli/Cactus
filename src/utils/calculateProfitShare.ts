import { Order } from '../types';

export const calculateProfitShare = (
  productName: string,
  netProfit: number
): { yassirShare: number; basimShare: number } => {
  switch (productName) {
    case 'Lines RGB Light':
      return {
        yassirShare: netProfit * 0.9,
        basimShare: netProfit * 0.1
      };
    case 'Mousepad':
      return {
        yassirShare: netProfit * 0.7,
        basimShare: netProfit * 0.3
      };
    case 'Smart Cube':
      return {
        yassirShare: 0,
        basimShare: netProfit
      };
    default:
      return {
        yassirShare: 0,
        basimShare: netProfit
      };
  }
};

export const calculateOrderProfitShare = (order: Order) => {
  const totalRevenue = order.items.reduce((sum, item) => 
    sum + (item.product.sellingPrice * item.quantity), 
    0
  );

  let totalPartnerShare = 0;
  let totalMyShare = 0;

  order.items.forEach(item => {
    const revenue = item.product.sellingPrice * item.quantity;
    const cost = item.product.cost * item.quantity;
    
    // Calculate this item's proportion of total revenue
    const revenueProportion = revenue / totalRevenue;
    
    // Distribute expenses proportionally based on revenue
    const itemExpenseShare = (order.shippingCost + order.paymentFees) * revenueProportion;
    
    // Calculate net profit
    const itemProfit = revenue - cost - itemExpenseShare;
    
    const shares = calculateProfitShare(item.product.name, itemProfit);
    totalPartnerShare += shares.yassirShare;
    totalMyShare += shares.basimShare;
  });

  return {
    partnerGrossShare: totalPartnerShare,
    myGrossShare: totalMyShare,
    partnerShare: totalPartnerShare,
    myShare: totalMyShare
  };
};