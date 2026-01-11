import { Order } from '../../types';
import { calculateTotalProfitShare } from '../profitSharing/profit';

/**
 * Export orders to CSV with comprehensive financial data
 * 
 * Columns:
 * 1. Order Number
 * 2. Customer Name
 * 3. Shipping Method
 * 4. Payment Method
 * 5. Products (JSON format: [["name", qty, "sku"], ...])
 * 6. Subtotal
 * 7. Shipping Cost
 * 8. Discount
 * 9. Total
 * 10. Payment Fee
 * 11. Net Profit
 * 12. Basim Net Profit
 * 13. Yasir Net Profit
 */
export const exportOrdersToCSV = async (orders: Order[]): Promise<string> => {
  const headers = [
    'Order Number',
    'Customer Name',
    'Shipping Method',
    'Payment Method',
    'Products',
    'Subtotal',
    'Shipping Cost',
    'Discount',
    'Total',
    'Payment Fee',
    'Net Profit',
    'Basim Net Profit',
    'Yasir Net Profit'
  ].join(',');

  const rows = await Promise.all(
    orders.map(async (order) => {
      // Calculate profit shares using existing function
      const discountAmount = order.discount
        ? order.discount.type === 'percentage'
          ? (order.subtotal * order.discount.value) / 100
          : order.discount.value
        : 0;

      const profitShare = await calculateTotalProfitShare(
        order.items,
        order.shippingCost,
        order.paymentFees,
        discountAmount,
        order.isFreeShipping
      );

      // Format products as JSON array matching Salla import format
      // [["Product Name", quantity, "SKU"], ...]
      const productsJson = JSON.stringify(
        order.items.map(item => [
          item.product.name,
          item.quantity,
          item.product.sku
        ])
      );

      // Calculate discount value for export
      const discountValue = order.discount
        ? order.discount.type === 'percentage'
          ? `${order.discount.value}%`
          : order.discount.value.toFixed(2)
        : '0';

      return [
        escapeCSV(order.orderNumber),
        escapeCSV(order.customerName || ''),
        escapeCSV(order.shippingMethod.name),
        escapeCSV(order.paymentMethod.name),
        escapeCSV(productsJson),
        order.subtotal.toFixed(2),
        order.shippingCost.toFixed(2),
        discountValue,
        order.total.toFixed(2),
        order.paymentFees.toFixed(2),
        order.netProfit.toFixed(2),
        profitShare.totalBasimShare.toFixed(2),
        profitShare.totalYassirShare.toFixed(2)
      ].join(',');
    })
  );

  return [headers, ...rows].join('\n');
};

/**
 * Escape CSV fields that contain special characters
 */
const escapeCSV = (value: string): string => {
  if (!value) return '';

  // If the value contains comma, quote, or newline, wrap it in quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    // Escape existing quotes by doubling them
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
};

/**
 * Download CSV file to user's computer
 */
export const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};