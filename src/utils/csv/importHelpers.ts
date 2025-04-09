import { Product, OrderItem } from '../../types';
import { getProducts } from '../../data/products';

export const parseCSVRow = (row: string): string[] => {
  const values: string[] = [];
  let currentValue = '';
  let insideQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      values.push(currentValue.trim());
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  values.push(currentValue.trim());
  return values;
};

export const findProductInSystem = (
  productId: string,
  productName: string,
  systemProducts: Product[]
): Product | null => {
  // First try to find by ID
  const productById = systemProducts.find(p => p.id === productId);
  if (productById) return productById;

  // If not found by ID, try to find by name
  const productByName = systemProducts.find(p => p.name === productName);
  if (productByName) return productByName;

  return null;
};

export const createOrderItems = (
  productIds: string[],
  productNames: string[],
  quantities: number[]
): OrderItem[] => {
  const systemProducts = getProducts();
  
  return productIds.map((productId, index) => {
    const productName = productNames[index];
    const quantity = quantities[index];

    const product = findProductInSystem(productId, productName, systemProducts);
    
    if (!product) {
      throw new Error(`Product not found in system: ${productName}`);
    }

    return {
      product,
      quantity
    };
  });
};