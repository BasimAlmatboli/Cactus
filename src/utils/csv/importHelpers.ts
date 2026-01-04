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
  productSKU: string,
  systemProducts: Product[]
): Product | null => {
  // First try to find by SKU (most reliable)
  if (productSKU) {
    const productBySKU = systemProducts.find(p => p.sku === productSKU);
    if (productBySKU) return productBySKU;
  }

  // Then try to find by ID
  const productById = systemProducts.find(p => p.id === productId);
  if (productById) return productById;

  // Finally try to find by name
  const productByName = systemProducts.find(p => p.name === productName);
  if (productByName) return productByName;

  return null;
};

export const createOrderItems = async (
  productIds: string[],
  productNames: string[],
  productSKUs: string[],
  quantities: number[]
): Promise<OrderItem[]> => {
  const systemProducts = await getProducts(); // Now async

  return productIds.map((productId, index) => {
    const productName = productNames[index];
    const productSKU = productSKUs[index];
    const quantity = quantities[index];

    const product = findProductInSystem(productId, productName, productSKU, systemProducts);

    if (!product) {
      console.warn(`Product not found in system: ${productName} (SKU: ${productSKU}). Creating placeholder.`);
      return {
        product: {
          id: productId || `imported-${Date.now()}-${index}`,
          name: productName,
          sku: productSKU || `IMP-${Date.now()}-${index}`,
          cost: 0,
          sellingPrice: 0,
          owner: 'basim' // Default owner for imported products
        },
        quantity
      };
    }

    return {
      product,
      quantity
    };
  });
};