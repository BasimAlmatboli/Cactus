import React from 'react';
import { Order } from '../types';
import { calculateTotalProfitShare } from '../utils/profitSharing';

interface OrderSummaryProps {
  order: Order;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ order }) => {
  const formatDiscount = () => {
    if (!order.discount) return null;
    
    const value = order.discount.type === 'percentage' 
      ? `${order.discount.value}%`
      : `${order.discount.value} SAR`;
      
    return order.discount.code 
      ? `${value} (${order.discount.code})`
      : value;
  };

  const discountAmount = order.discount
    ? order.discount.type === 'percentage'
      ? (order.subtotal * order.discount.value) / 100
      : order.discount.value
    : 0;
  
  // Calculate detailed profit sharing
  const profitSharing = calculateTotalProfitShare(
    order.items,
    order.shippingCost,
    order.paymentFees,
    discountAmount,
    order.isFreeShipping
  );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Order Summary</h2>
      <div className="bg-white rounded-lg shadow p-4 space-y-3">
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.product.id} className="flex justify-between">
              <span>{item.product.name} x{item.quantity}</span>
              <span>{item.product.sellingPrice * item.quantity} SAR</span>
            </div>
          ))}
        </div>
        
        <hr />
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{order.subtotal.toFixed(2)} SAR</span>
          </div>
          
          {order.discount && (
            <div className="flex justify-between text-green-600">
              <span>Discount {formatDiscount()}</span>
              <span>-{discountAmount.toFixed(2)} SAR</span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span>Shipping ({order.shippingMethod.name})</span>
            <div className="text-right">
              {order.isFreeShipping ? (
                <>
                  <span className="text-green-600 font-medium">Free</span>
                  <span className="text-sm text-gray-400 line-through ml-2">
                    {order.shippingCost.toFixed(2)} SAR
                  </span>
                </>
              ) : (
                <span>{order.shippingCost.toFixed(2)} SAR</span>
              )}
            </div>
          </div>
        </div>
        
        <hr />
        
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{order.total.toFixed(2)} SAR</span>
        </div>

        {/* Detailed Profit Sharing Breakdown */}
        <div className="mt-6 space-y-4">
          <h3 className="font-medium text-gray-700">Profit Sharing Breakdown</h3>
          
          {/* Per Product Breakdown */}
          <div className="space-y-4">
            {profitSharing.itemShares.map((share, index) => {
              const item = order.items[index];
              return (
                <div key={item.product.id} className="bg-gray-50 rounded-md p-3 space-y-2">
                  <div className="font-medium text-gray-800">
                    {item.product.name} x{item.quantity}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-gray-600">Total</div>
                      <div className="font-medium">{share.total.toFixed(2)} SAR</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Cost</div>
                      <div className="font-medium text-red-600">-{share.cost.toFixed(2)} SAR</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Expense Share ({(share.revenueProportion * 100).toFixed(1)}%)</div>
                      <div className="font-medium text-red-600">-{share.expenseShare.toFixed(2)} SAR</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Net Profit</div>
                      <div className="font-medium text-green-600">{share.netProfit.toFixed(2)} SAR</div>
                    </div>
                  </div>
                  
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <div className="text-gray-600">Yassir's Share</div>
                        <div className="font-medium text-blue-600">{share.yassirShare.toFixed(2)} SAR</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Basim's Share</div>
                        <div className="font-medium text-green-600">{share.basimShare.toFixed(2)} SAR</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Total Shares */}
          <div className="bg-indigo-50 rounded-md p-3">
            <div className="font-medium text-indigo-800 mb-2">Total Shares</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-indigo-600">Yassir's Total Share</div>
                <div className="text-lg font-bold text-indigo-700">
                  {profitSharing.totalYassirShare.toFixed(2)} SAR
                </div>
              </div>
              <div>
                <div className="text-sm text-indigo-600">Basim's Total Share</div>
                <div className="text-lg font-bold text-indigo-700">
                  {profitSharing.totalBasimShare.toFixed(2)} SAR
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};