import { Product } from '../types';

export const exportProductsToCSV = (products: Product[]): string => {
  const headers = [
    'Product Name',
    'Cost',
    'Selling Price'
  ].join(',');

  const rows = products.map(product => [
    `"${product.name}"`,
    product.cost,
    product.sellingPrice
  ].join(','));

  return [headers, ...rows].join('\n');
};

export const importProductsFromCSV = async (file: File): Promise<Product[]> => {
  const text = await file.text();
  const lines = text.split('\n');
  const headers = lines[0].split(',');
  const rows = lines.slice(1);

  return rows.filter(row => row.trim()).map(row => {
    const values = row.split(',');
    const getValue = (index: number) => values[index]?.trim().replace(/"/g, '') || '';

    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: getValue(0),
      cost: parseFloat(getValue(1)),
      sellingPrice: parseFloat(getValue(2))
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