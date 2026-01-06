import { Order } from '../../types';
import { supabase } from '../../lib/supabase';
import { createOrderCSVHeaders, createOrderCSVRow } from './exportHelpers';
import { parseCSVRow, createOrderItems } from './importHelpers';
import { generateUUID } from '../uuid';
import { calculatePaymentFees } from '../orderCalculations';

export const exportOrdersToCSV = (orders: Order[]): string => {
  const headers = createOrderCSVHeaders();
  const rows = orders.map(order => createOrderCSVRow(order));
  return [headers, ...rows].join('\n');
};

export const importOrdersFromCSV = async (file: File): Promise<void> => {
  // Fetch all payment methods for fee calculation
  const { data: dbPaymentMethods } = await supabase
    .from('payment_methods')
    .select('*');

  const paymentMethodsMap = new Map(
    dbPaymentMethods?.map(pm => [pm.id, pm]) || []
  );

  const text = await file.text();
  const lines = text.split('\n');
  const rows = lines.slice(1); // Skip header row

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
        cost: parseFloat(getValue(9)),
        is_active: true // Default to true for imported orders
      };

      // Get payment method ID from CSV
      const paymentMethodId = getValue(7).toLowerCase();

      // Look up full details from database to get fee structure
      const dbPaymentMethod = paymentMethodsMap.get(paymentMethodId);

      // Construct payment method object (using DB details if available, or fallback defaults)
      const paymentMethod = {
        id: paymentMethodId,
        name: getValue(7),
        fee_percentage: dbPaymentMethod?.fee_percentage ?? 0,
        fee_fixed: dbPaymentMethod?.fee_fixed ?? 0,
        tax_rate: dbPaymentMethod?.tax_rate ?? 0,
        customer_fee: dbPaymentMethod?.customer_fee ?? 0,
        display_order: dbPaymentMethod?.display_order ?? 0,
        is_active: dbPaymentMethod?.is_active ?? true
      };

      const isFreeShipping = getValue(11).toLowerCase() === 'true';
      const subtotal = parseFloat(getValue(8));
      const shippingCost = parseFloat(getValue(9));

      const discountType = getValue(12);
      const discountValue = parseFloat(getValue(13));
      const discountCode = getValue(14);

      const discount = discountType && !isNaN(discountValue) ? {
        type: discountType as 'percentage' | 'fixed',
        value: discountValue,
        code: discountCode || undefined
      } : null;

      // Calculate actual shipping cost based on free shipping flag
      const actualShippingCost = isFreeShipping ? 0 : shippingCost;

      // Calculate discount amount
      const discountAmount = discount
        ? discount.type === 'percentage'
          ? (subtotal * discount.value) / 100
          : discount.value
        : 0;

      // Calculate the customer total (what customer pays before fees)
      const customerTotal = subtotal + actualShippingCost - discountAmount;

      // Calculate payment fees based on customer total (after discounts applied)
      let paymentFees = parseFloat(getValue(10));

      // If fees are missing in CSV, calculate them using the new system
      if (isNaN(paymentFees) || paymentFees <= 0) {
        paymentFees = calculatePaymentFees(paymentMethod, customerTotal);
      }

      const total = customerTotal;

      // Calculate total cost from items
      const totalCost = items.reduce((sum, item) =>
        sum + (item.product.cost * item.quantity),
        0
      );

      const netProfit = total - totalCost - shippingCost - paymentFees;

      // Format order for database (jsonb columns handle objects directly)
      const order = {
        id: generateUUID(),
        order_number: getValue(0),
        customer_name: getValue(1) || null,
        created_at: new Date().toISOString(), // Changed from date to created_at to match schema
        items: items, // jsonb handles arrays/objects
        shipping_method: shippingMethod,
        payment_method: paymentMethod,
        subtotal,
        shipping_cost: shippingCost,
        payment_fees: paymentFees,
        is_free_shipping: isFreeShipping,
        discount: discount,
        total,
        net_profit: netProfit,
        status: 'completed' // Default status for imports
      };

      // @ts-ignore - Supabase types need regeneration after schema changes
      const { error } = await supabase
        .from('orders')
        .insert(order);

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to import order ${order.order_number}: ${error.message}`);
      }
    } catch (error: any) {
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