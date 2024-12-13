import { Order } from '../types';
import { getProducts } from '../data/products';
import { getShippingMethods } from '../data/shipping';

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
      order.date,
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

export const importOrdersFromCSV = async (file: File): Promise<Order[]> => {
  const text = await file.text();
  const lines = text.split('\n');
  const headers = lines[0].split(',');
  const rows = lines.slice(1);

  const products = getProducts();
  const shippingMethods = getShippingMethods();

  return rows.filter(row => row.trim()).map(row => {
    const values = row.split(',');
    const getValue = (index: number) => values[index]?.trim() || '';

    // Parse products string and match with existing products
    const productsStr = getValue(2).replace(/"/g, '');
    const productItems = productsStr.split(';').map(item => {
      const match = item.trim().match(/(.+) \(x(\d+)\)/);
      if (!match) return null;
      
      const [, productName, quantity] = match;
      const product = products.find(p => p.name.trim() === productName.trim());
      
      if (!product) return null;
      
      return {
        product,
        quantity: parseInt(quantity, 10)
      };
    }).filter(item => item !== null);

    const shippingMethod = shippingMethods.find(
      method => method.name === getValue(3)
    ) || shippingMethods[0];

    const paymentMethod = {
      id: getValue(4).toLowerCase() as 'mada' | 'visa' | 'tamara',
      name: getValue(4)
    };

    // Parse free shipping status
    const isFreeShipping = getValue(8).toLowerCase() === 'true';

    // Parse discount information
    const discountType = getValue(9);
    const discountValue = parseFloat(getValue(10));
    const discountCode = getValue(11);

    const discount = discountType && !isNaN(discountValue) ? {
      type: discountType as 'percentage' | 'fixed',
      value: discountValue,
      code: discountCode || undefined
    } : null;

    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      orderNumber: getValue(0),
      date: getValue(1),
      items: productItems as Order['items'],
      shippingMethod,
      paymentMethod,
      subtotal: parseFloat(getValue(5)),
      shippingCost: parseFloat(getValue(6)),
      paymentFees: parseFloat(getValue(7)),
      isFreeShipping,
      discount,
      total: parseFloat(getValue(12)),
      netProfit: parseFloat(getValue(13))
    };
  });
};

export const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};