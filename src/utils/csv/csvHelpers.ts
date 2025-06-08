import { Order } from '../../types';
import { supabase } from '../../lib/supabase';
import { createOrderCSVHeaders, createOrderCSVRow } from './exportHelpers';
import { parseCSVRow, createOrderItems } from './importHelpers';
import { generateUUID } from '../uuid';
import { calculatePaymentFees } from '../calculateFees';

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
      const productSKUs = getValue(4).split(';').filter(Boolean);
      const quantities = getValue(5).split(';').map(q => parseInt(q, 10));

      // Create order items with proper product linking
      const items = await createOrderItems(productIds, productNames, productSKUs, quantities);

      const shippingMethod = {
        id: getValue(6).toLowerCase().replace(/\s+/g, '-'),
        name: getValue(6),
        cost: parseFloat(getValue(9))
      };

      const paymentMethod = {
        id: getValue(7).toLowerCase() as 'mada' | 'visa' | 'tamara',
        name: getValue(7)
      };

      const isFreeShipping = getValue(11).toLowerCase() === 'true';
      const subtotal = parseFloat(getValue(8));
      const shippingCost = parseFloat(getValue(9));

      // Calculate payment fees if not provided or invalid
      let paymentFees = parseFloat(getValue(10));
      if (isNaN(paymentFees) || paymentFees <= 0) {
        const actualShippingCost = isFreeShipping ? 0 : shippingCost;
        const totalBeforeFees = subtotal + actualShippingCost;
        paymentFees = calculatePaymentFees(paymentMethod.id, totalBeforeFees);
      }

      const discountType = getValue(12);
      const discountValue = parseFloat(getValue(13));
      const discountCode = getValue(14);

      const discount = discountType && !isNaN(discountValue) ? {
        type: discountType as 'percentage' | 'fixed',
        value: discountValue,
        code: discountCode || undefined
      } : null;

      // Calculate total and net profit
      const actualShippingCost = isFreeShipping ? 0 : shippingCost;
      const discountAmount = discount
        ? discount.type === 'percentage'
          ? (subtotal * discount.value) / 100
          : discount.value
        : 0;

      const total = subtotal + actualShippingCost - discountAmount;
      
      // Calculate total cost from items
      const totalCost = items.reduce((sum, item) => 
        sum + (item.product.cost * item.quantity), 
        0
      );

      const netProfit = total - totalCost - shippingCost - paymentFees;

      const order = {
        id: generateUUID(),
        order_number: getValue(0),
        customer_name: getValue(1) || null,
        items,
        shipping_method: shippingMethod,
        payment_method: paymentMethod,
        subtotal,
        shipping_cost: shippingCost,
        payment_fees: paymentFees,
        is_free_shipping: isFreeShipping,
        discount,
        total,
        net_profit: netProfit
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