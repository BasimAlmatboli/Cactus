import React from 'react';
import { OrderItem } from '../types';
import { calculateProfitShare } from '../utils/calculateProfitShare';
import { Users } from 'lucide-react';

interface ProfitSharingDisplayProps {
  items: OrderItem[];
  totalExpenses: number;
}

export const ProfitSharingDisplay: React.FC<ProfitSharingDisplayProps> = ({
  items,
  totalExpenses
}) => {
  // Calculate total revenue from all items
  const totalRevenue = items.reduce((sum, item) => 
    sum + (item.product.sellingPrice * item.quantity), 
    0
  );

  // Calculate profit share for each item
  const profitShares = items.map(item => {
    const revenue = item.product.sellingPrice * item.quantity;
    const cost = item.product.cost * item.quantity;
    
    // Calculate this item's proportion of total revenue
    const revenueProportion = revenue / totalRevenue;
    
    // Distribute expenses proportionally based on revenue
    const itemExpenseShare = totalExpenses * revenueProportion;
    
    // Calculate net profit by adding shipping to revenue first, then deducting costs
    const itemProfit = revenue - cost;
    const netProfit = itemProfit - itemExpenseShare;
    
    const shares = calculateProfitShare(item.product.name, netProfit);
    
    return {
      productName: item.product.name,
      ...shares
    };
  });

  const totalShares = profitShares.reduce(
    (acc, share) => ({
      yassirShare: acc.yassirShare + share.yassirShare,
      basimShare: acc.basimShare + share.basimShare
    }),
    { yassirShare: 0, basimShare: 0 }
  );

  return (
    <div className="mt-4 space-y-4 p-3 bg-indigo-50 rounded-md">
      <h3 className="font-medium text-indigo-800 flex items-center gap-2">
        <Users className="h-5 w-5" />
        <span>Profit Sharing</span>
      </h3>
      
      <div className="space-y-3">
        {profitShares.map((share, index) => (
          <div key={index} className="text-sm">
            <div className="font-medium text-indigo-700">{share.productName}</div>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div>
                <span className="text-indigo-600">Yassir:</span>
                <span className="ml-2">{share.yassirShare.toFixed(2)} SAR</span>
              </div>
              <div>
                <span className="text-indigo-600">Basim:</span>
                <span className="ml-2">{share.basimShare.toFixed(2)} SAR</span>
              </div>
            </div>
          </div>
        ))}
        
        <div className="border-t border-indigo-200 pt-2 mt-2">
          <div className="font-medium text-indigo-800">Total Shares</div>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div>
              <span className="text-indigo-600 font-medium">Yassir Total:</span>
              <span className="ml-2">{totalShares.yassirShare.toFixed(2)} SAR</span>
            </div>
            <div>
              <span className="text-indigo-600 font-medium">Basim Total:</span>
              <span className="ml-2">{totalShares.basimShare.toFixed(2)} SAR</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};