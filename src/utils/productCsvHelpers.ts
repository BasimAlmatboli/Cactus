import { Product } from '../types';

export const exportProductsToCSV = (products: Product[]): string => {
  const headers = [
    'Product Name',
    'SKU',
    'Cost',
    'Selling Price',
    'Owner'
  ].join(',');

  const rows = products.map(product => [
    `"${product.name}"`,
    `"${product.sku}"`,
    product.cost,
    product.sellingPrice,
    product.owner
  ].join(','));

  return [headers, ...rows].join('\n');
};

export const importProductsFromCSV = async (file: File): Promise<Product[]> => {
  const text = await file.text();
  const lines = text.split('\n');
  const headers = lines[0].split(',');
  const rows = lines.slice(1);

  return rows.filter(row => row.trim()).map((row, index) => {
    const values = row.split(',');
    const getValue = (index: number) => values[index]?.trim().replace(/"/g, '') || '';

    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: getValue(0),
      sku: getValue(1) || `IMP-${Date.now()}-${index}`,
      cost: parseFloat(getValue(2)) || 0,
      sellingPrice: parseFloat(getValue(3)) || 0,
      owner: (getValue(4) as 'yassir' | 'basim') || 'basim'
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