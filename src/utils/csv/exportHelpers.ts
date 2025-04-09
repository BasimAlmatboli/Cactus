import { Order } from '../../types';

export const createOrderCSVHeaders = (): string => {
  return [
    'Order Number',
    'Date',
    'Product IDs',
    'Product Names',
    'Quantities',
    'Shipping Method',
    'Payment Method',
    'Subtotal',
    'Shipping Cost',
    'Payment Fees',
    'Is Free Shipping',
    'Discount Type',
    'Discount Value',
    'Discount Code',
    'Total',
    'Net Profit'
  ].join(',');
};

export const createOrderCSVRow = (order: Order): string => {
  // Separate product information for better importing
  const productIds = order.items.map(item => item.product.id).join(';');
  const productNames = order.items.map(item => item.product.name).join(';');
  const quantities = order.items.map(item => item.quantity).join(';');
  
  const discount = order.discount 
    ? `${order.discount.type},${order.discount.value},${order.discount.code || ''}`
    : ',,';

  return [
    order.orderNumber,
    new Date(order.date).toISOString(),
    `"${productIds}"`,
    `"${productNames}"`,
    `"${quantities}"`,
    order.shippingMethod.name,
    order.paymentMethod.name,
    order.subtotal,
    order.shippingCost,
    order.paymentFees,
    order.isFreeShipping ? 'true' : 'false',
    ...discount.split(','),
    order.total,
    order.netProfit
  ].join(',');
};