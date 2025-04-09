import { Order } from '../../types';
import { supabase } from '../../lib/supabase';
import { createOrderCSVHeaders, createOrderCSVRow } from './exportHelpers';
import { parseCSVRow, createOrderItems } from './importHelpers';

export const exportOrdersToCSV = (orders: Order[]): string => {
  const headers = createOrderCSVHeaders();
  const rows = orders.map(order => createOrderCSVRow(order));
  return [headers, ...rows].join('\n');
};

export const importOrdersFromCSV = async (file: File): Promise<void> => {
  const text = await file.text();
  const lines = text.split('\n');
  const headers = lines[0].split(',');
  const rows = lines.slice(1);

  for (const row of rows) {
    if (!row.trim()) continue;

    const values = parseCSVRow(row);
    const getValue = (index: number) => values[index]?.replace(/"/g, '').trim() || '';

    try {
      // Parse product information
      const productIds = getValue(2).split(';').filter(Boolean);
      const productNames = getValue(3).split(';').filter(Boolean);
      const quantities = getValue(4).split(';').map(q => parseInt(q, 10));

      // Create order items with proper product linking
      const items = createOrderItems(productIds, productNames, quantities);

      const shippingMethod = {
        id: getValue(5).toLowerCase().replace(/\s+/g, '-'),
        name: getValue(5),
        cost: parseFloat(getValue(8))
      };

      const paymentMethod = {
        id: getValue(6).toLowerCase() as 'mada' | 'visa' | 'tamara',
        name: getValue(6)
      };

      const isFreeShipping = getValue(10).toLowerCase() === 'true';

      const discountType = getValue(11);
      const discountValue = parseFloat(getValue(12));
      const discountCode = getValue(13);

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
        subtotal: parseFloat(getValue(7)),
        shipping_cost: parseFloat(getValue(8)),
        payment_fees: parseFloat(getValue(9)),
        is_free_shipping: isFreeShipping,
        discount,
        total: parseFloat(getValue(14)),
        net_profit: parseFloat(getValue(15))
      };

      const { error } = await supabase
        .from('orders')
        .insert(order);

      if (error) {
        throw new Error(`Failed to import order ${order.order_number}: ${error.message}`);
      }
    } catch (error) {
      console.error('Error processing row:', error);
      throw new Error(`Failed to process row: ${error.message}`);
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