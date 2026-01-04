import React, { useState, useEffect } from 'react';
import { X, Package, Truck, CreditCard, Tag, Receipt, User, Hash } from 'lucide-react';
import { Order } from '../../types';
import { calculateTotalProfitShare } from '../../utils/profitSharing';

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose }) => {
  const [profitSharing, setProfitSharing] = useState<any>(null);

  useEffect(() => {
    const calculateProfit = async () => {
      if (!order) {
        setProfitSharing(null);
        return;
      }

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

  if (!order) return null;

  const discountAmount = order.discount
    ? order.discount.type === 'percentage'
      ? (order.subtotal * order.discount.value) / 100
      : order.discount.value
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1C1F26] rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <h2 className="text-xl font-semibold">Order Details</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-4rem)]">
          {/* Order Information */}
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="text-sm text-gray-400">Order Number</div>
                <div className="text-lg font-medium text-white">{order.orderNumber}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-400">Date</div>
                <div className="text-lg font-medium text-white">
                  {new Date(order.date).toLocaleDateString()}
                </div>
              </div>
              {order.customerName && (
                <div className="space-y-2">
                  <div className="text-sm text-gray-400 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Customer Name
                  </div>
                  <div className="text-lg font-medium text-white">{order.customerName}</div>
                </div>
              )}
            </div>

            {/* Products */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white flex items-center gap-2">
                <Package className="h-5 w-5" />
                Products
              </h3>
              <div className="bg-[#13151A] rounded-lg p-4 space-y-4 border border-gray-800">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="font-medium text-white">{item.product.name}</div>
                      {item.product.sku && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Hash className="h-3 w-3 mr-1" />
                          <span>{item.product.sku}</span>
                        </div>
                      )}
                      <div className="text-sm text-gray-400">
                        Quantity: {item.quantity} × {item.product.sellingPrice} SAR
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-white">
                        {(item.product.sellingPrice * item.quantity).toFixed(2)} SAR
                      </div>
                      <div className="text-sm text-green-400">
                        Profit: {((item.product.sellingPrice - item.product.cost) * item.quantity).toFixed(2)} SAR
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Payment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping
                </h3>
                <div className="bg-[#13151A] rounded-lg p-4 border border-gray-800">
                  <div className="font-medium text-white">{order.shippingMethod.name}</div>
                  <div className="text-sm text-gray-400">
                    {order.isFreeShipping ? (
                      <span className="text-green-400 font-medium">Free Shipping</span>
                    ) : (
                      `${order.shippingCost} SAR`
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment
                </h3>
                <div className="bg-[#13151A] rounded-lg p-4 border border-gray-800">
                  <div className="font-medium text-white">{order.paymentMethod.name}</div>
                  <div className="text-sm text-gray-400">
                    Fees: {order.paymentFees.toFixed(2)} SAR
                  </div>
                </div>
              </div>
            </div>

            {/* Discount */}
            {order.discount && (
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Discount Applied
                </h3>
                <div className="bg-[#13151A] rounded-lg p-4 border border-gray-800">
                  <div className="font-medium text-white">
                    {order.discount.type === 'percentage'
                      ? `${order.discount.value}% Off`
                      : `${order.discount.value} SAR Off`
                    }
                  </div>
                  {order.discount.code && (
                    <div className="text-sm text-gray-400">
                      Code: {order.discount.code}
                    </div>
                  )}
                  <div className="text-sm text-green-400">
                    Saved: {discountAmount.toFixed(2)} SAR
                  </div>
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-white flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Summary
              </h3>
              <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 rounded-lg p-4 space-y-4 border border-blue-800/30">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Subtotal:</span>
                    <span className="float-right font-medium text-white">{order.subtotal.toFixed(2)} SAR</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Shipping:</span>
                    <span className="float-right font-medium text-white">
                      {order.isFreeShipping ? (
                        <span className="text-green-400">Free</span>
                      ) : (
                        `${order.shippingCost.toFixed(2)} SAR`
                      )}
                    </span>
                  </div>
                  {order.discount && (
                    <div className="text-green-400">
                      <span>Discount:</span>
                      <span className="float-right font-medium">
                        -{discountAmount.toFixed(2)} SAR
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-400">Payment Fees:</span>
                    <span className="float-right font-medium text-white">{order.paymentFees.toFixed(2)} SAR</span>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-4 grid grid-cols-2 gap-4">
                  <div className="text-lg">
                    <span className="font-medium text-white">Total:</span>
                    <span className="float-right font-bold text-white">{order.total.toFixed(2)} SAR</span>
                  </div>
                  <div className="text-lg text-green-400">
                    <span className="font-medium">Net Profit:</span>
                    <span className="float-right font-bold">{order.netProfit.toFixed(2)} SAR</span>
                  </div>
                </div>

                {/* Profit Sharing */}
                {profitSharing ? (
                  <div className="border-t border-gray-700 pt-4 mt-4">
                    <div className="text-sm font-medium text-gray-300 mb-2">Profit Sharing</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-blue-400">Yassir's Share:</span>
                        <span className="float-right font-medium text-white">
                          {profitSharing.totalYassirShare.toFixed(2)} SAR
                        </span>
                      </div>
                      <div>
                        <span className="text-green-400">Basim's Share:</span>
                        <span className="float-right font-medium text-white">
                          {profitSharing.totalBasimShare.toFixed(2)} SAR
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-gray-700 pt-4 mt-4 text-sm text-gray-500">
                    Calculating profit shares...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};