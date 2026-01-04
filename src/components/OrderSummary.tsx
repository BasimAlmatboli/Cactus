import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { calculateTotalProfitShare } from '../utils/profitSharing';
import { EarningsReport } from './EarningsReport';
import { getPaymentFeePercentage } from '../utils/calculateFees';

interface OrderSummaryProps {
  order: Order;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ order }) => {
  const [profitSharing, setProfitSharing] = useState<any>(null);

  useEffect(() => {
    const calculateProfit = async () => {
      const discountAmount = order.discount
        ? order.discount.type === 'percentage'
          ? (order.subtotal * order.discount.value) / 100
          : order.discount.value
        : 0;

      const result = await calculateTotalProfitShare(
        order.items,
        order.shippingCost,
        order.paymentFees,
        discountAmount,
        order.isFreeShipping
      );
      setProfitSharing(result);
    };

    calculateProfit();
  }, [order]);

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

  const totalDiscountAmount = discountAmount;

  // Calculate the total amount before fees (base for payment fee calculation)
  const actualShippingCost = order.isFreeShipping ? 0 : order.shippingCost;
  const totalBeforeFees = order.subtotal + actualShippingCost - totalDiscountAmount;

  // Get the payment fee percentage for the selected payment method
  const feePercentage = getPaymentFeePercentage(order.paymentMethod.id);

  // Show loading while calculating profit
  if (!profitSharing) {
    return <div className="text-center py-4 text-gray-400">Calculating profit...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Order Summary</h2>
      <div className="bg-[#1C1F26] rounded-xl border border-gray-800 p-6 space-y-4 shadow-xl">
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.product.id} className="flex justify-between text-gray-300">
              <span>{item.product.name} x{item.quantity}</span>
              <span className="text-white font-medium">{item.product.sellingPrice * item.quantity} SAR</span>
            </div>
          ))}
        </div>

        <hr className="border-gray-800" />

        <div className="space-y-3 text-sm">
          <div className="flex justify-between text-gray-400">
            <span>Subtotal</span>
            <span className="text-white">{order.subtotal.toFixed(2)} SAR</span>
          </div>

          {order.discount && (
            <div className="flex justify-between text-green-400">
              <span>Discount {formatDiscount()}</span>
              <span>-{discountAmount.toFixed(2)} SAR</span>
            </div>
          )}


          <div className="flex justify-between items-center text-gray-400">
            <span>Shipping ({order.shippingMethod.name})</span>
            <div className="text-right">
              {order.isFreeShipping ? (
                <>
                  <span className="text-green-400 font-medium">Free</span>
                  <span className="text-sm text-gray-600 line-through ml-2">
                    {order.shippingCost.toFixed(2)} SAR
                  </span>
                </>
              ) : (
                <span className="text-white">{order.shippingCost.toFixed(2)} SAR</span>
              )}
            </div>
          </div>
        </div>

        <hr className="border-gray-800" />

        <div className="flex justify-between text-lg font-bold text-white">
          <span>Total</span>
          <span>{order.total.toFixed(2)} SAR</span>
        </div>

        {/* Payment Fee Information (shown separately) */}
        <div className="mt-4 bg-[#13151A] rounded-xl p-4 space-y-3 border border-gray-800">
          <div className="font-medium text-blue-400">Payment Fee Information</div>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-gray-400">Base Amount:</div>
              <div className="text-right font-medium text-gray-300">{totalBeforeFees.toFixed(2)} SAR</div>
              <div className="col-span-2 text-xs text-gray-500">
                (Subtotal + Shipping - Discount)
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="text-gray-400">Fee Percentage:</div>
              <div className="text-right font-medium text-gray-300">{feePercentage}%</div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800">
              <div className="text-gray-400">Payment Fee:</div>
              <div className="text-right font-medium text-red-400">-{order.paymentFees.toFixed(2)} SAR</div>
            </div>
          </div>
        </div>

        {/* Detailed Profit Sharing Breakdown */}
        <div className="mt-6 space-y-4">
          <h3 className="font-medium text-gray-300">Profit Sharing Breakdown</h3>

          {/* Per Product Breakdown */}
          <div className="space-y-4">
            {profitSharing.itemShares.map((share: any, index: number) => {
              const item = order.items[index];
              return (
                <div key={item.product.id} className="bg-[#13151A] rounded-xl border border-gray-800 p-4 space-y-3">
                  <div className="font-medium text-white border-b border-gray-800 pb-2">
                    {item.product.name} x{item.quantity}
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                    <div>
                      <div className="text-gray-500 text-xs uppercase tracking-wider">Total</div>
                      <div className="font-medium text-white">{share.total.toFixed(2)} SAR</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs uppercase tracking-wider">Cost</div>
                      <div className="font-medium text-red-400">-{share.cost.toFixed(2)} SAR</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs uppercase tracking-wider">Exp. Share ({(share.revenueProportion * 100).toFixed(1)}%)</div>
                      <div className="font-medium text-red-400">-{share.expenseShare.toFixed(2)} SAR</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs uppercase tracking-wider">Net Profit</div>
                      <div className="font-medium text-green-400">{share.netProfit.toFixed(2)} SAR</div>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-gray-800">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Yassir's Share</div>
                        <div className="font-medium text-blue-400">{share.yassirShare.toFixed(2)} SAR</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Basim's Share</div>
                        <div className="font-medium text-green-400">{share.basimShare.toFixed(2)} SAR</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total Shares */}
          <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 rounded-xl p-5 border border-blue-500/20">
            <div className="font-medium text-blue-300 mb-4">Total Shares</div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-sm text-blue-400/80 mb-1">Yassir's Total Share</div>
                <div className="text-2xl font-bold text-blue-300">
                  {profitSharing.totalYassirShare.toFixed(2)} <span className="text-sm font-normal">SAR</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-green-400/80 mb-1">Basim's Total Share</div>
                <div className="text-2xl font-bold text-green-300">
                  {profitSharing.totalBasimShare.toFixed(2)} <span className="text-sm font-normal">SAR</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Earnings Report */}
        <EarningsReport
          items={order.items}
          totalYassirShare={profitSharing.totalYassirShare}
          totalBasimShare={profitSharing.totalBasimShare}
        />
      </div>
    </div>
  );
};