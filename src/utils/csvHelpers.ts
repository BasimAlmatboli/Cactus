import { Order } from '../types';
import { supabase } from '../lib/supabase';
import { transformOrderForSupabase } from './transformers/orderTransformer';

export const exportOrdersToCSV = (orders: Order[]): string => {
  const headers = [
    'Order Number',
    'Date',
    'Products',
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

  const rows = orders.map(order => {
    const products = order.items
      .map(item => `${item.product.name} (x${item.quantity})`)
      .join('; ');
    
    const discount = order.discount 
      ? `${order.discount.type},${order.discount.value},${order.discount.code || ''}`
      : ',,';

    return [
      order.orderNumber,
      new Date(order.date).toISOString(),
      `"${products}"`,
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
  });

  return [headers, ...rows].join('\n');
};

export const importOrdersFromCSV = async (file: File): Promise<void> => {
  const text = await file.text();
  const lines = text.split('\n');
  const headers = lines[0].split(',');
  const rows = lines.slice(1);

  for (const row of rows) {
    if (!row.trim()) continue;

    const values = row.split(',');
    const getValue = (index: number) => values[index]?.trim() || '';

    // Parse products string and match with existing products
    const productsStr = getValue(2).replace(/"/g, '');
    const items = productsStr.split(';').map(item => {
      const match = item.trim().match(/(.+) \(x(\d+)\)/);
      if (!match) return null;
      
      const [, productName, quantity] = match;
      
      return {
        product: {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: productName.trim(),
          // Since we don't have access to the original product data in CSV,
          // we'll need to set these as 0 or handle them differently
          cost: 0,
          sellingPrice: 0
        },
        quantity: parseInt(quantity, 10)
      };
    }).filter(item => item !== null);

    const shippingMethod = {
      id: getValue(3).toLowerCase().replace(/\s+/g, '-'),
      name: getValue(3),
      cost: parseFloat(getValue(6))
    };

    const paymentMethod = {
      id: getValue(4).toLowerCase() as 'mada' | 'visa' | 'tamara',
      name: getValue(4)
    };

    const isFreeShipping = getValue(8).toLowerCase() === 'true';

    const discountType = getValue(9);
    const discountValue = parseFloat(getValue(10));
    const discountCode = getValue(11);

    const discount = discountType && !isNaN(discountValue) ? {
      type: discountType as 'percentage' | 'fixed',
      value: discountValue,
      code: discountCode || undefined
    } : null;

    const order = {
      order_number: getValue(0),
      items,
      shipping_method: shippingMethod,
      payment_method: paymentMethod,
      subtotal: parseFloat(getValue(5)),
      shipping_cost: parseFloat(getValue(6)),
      payment_fees: parseFloat(getValue(7)),
      is_free_shipping: isFreeShipping,
      discount,
      total: parseFloat(getValue(12)),
      net_profit: parseFloat(getValue(13))
    };

    // Insert into Supabase
    const { error } = await supabase
      .from('orders')
      .insert(order);

    if (error) {
      console.error('Error importing order:', error);
      throw new Error(`Failed to import order ${order.order_number}`);
    }
  }
};

export const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};