import { Product } from '../types';
import {
  getProducts as getProductsFromDB,
  createProduct as createProductInDB,
  updateProduct as updateProductInDB,
  deleteProduct as deleteProductInDB,
  checkSkuExists
} from '../services/productService';

/**
 * Products Data Layer
 * 
 * This module now uses the database instead of localStorage.
 * All product operations go through the productService.
 */

/**
 * Get all active products from database
 */
export const getProducts = async (): Promise<Product[]> => {
  try {
    return await getProductsFromDB();
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Save/Update a product in the database
 * If product exists (has id), update it. Otherwise create new.
 */
export const saveProduct = async (product: Product): Promise<Product> => {
  try {
    // Check if product already exists
    const existingProducts = await getProductsFromDB();
    const exists = existingProducts.some(p => p.id === product.id);

    if (exists) {
      // Update existing product
      return await updateProductInDB(product.id, product);
    } else {
      // Create new product
      return await createProductInDB(product);
    }
  } catch (error) {
    console.error('Error saving product:', error);
    throw error;
  }
};

/**
 * Save multiple products (for bulk operations)
 */
export const saveProducts = async (products: Product[]): Promise<void> => {
  try {
    // Save each product
    for (const product of products) {
      await saveProduct(product);
    }
  } catch (error) {
    console.error('Error saving products:', error);
    throw error;
  }
};

/**
 * Delete a product from database
 */
export const deleteProduct = async (productId: string): Promise<void> => {
  try {
    await deleteProductInDB(productId);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

/**
 * Generate SKU from product name
 */
const generateSKU = (name: string, id: string): string => {
  const words = name.toUpperCase().split(' ');
  const prefix = words.map(word => word.substring(0, 3)).join('-');
  const suffix = id.substring(0, 3).toUpperCase();
  return `${prefix}-${suffix}`;
};

/**
 * Generate unique SKU for a new product
 */
export const generateUniqueSKU = async (name: string): Promise<string> => {
  const baseSKU = generateSKU(name, Date.now().toString());
  let counter = 1;
  let sku = baseSKU;

  // Check if SKU exists in database
  while (await checkSkuExists(sku)) {
    sku = `${baseSKU}-${counter.toString().padStart(3, '0')}`;
    counter++;
  }

  return sku;
};

