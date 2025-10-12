import { Product } from '../types';

const defaultProducts: Product[] = [
  {
    id: 'Old RGB Light',
    name: 'Old RGB Light',
    sku: 'RGB-001',
    cost: 130,
    sellingPrice: 199,
    owner: 'yassir'
  },
  {
    id: 'New RGB Light',
    name: 'New RGB Light',
    sku: 'RGB-NEW-001',
    cost: 130,
    sellingPrice: 215,
    owner: 'yassir'
  },
  {
    id: 'Mousepad',
    name: 'Mousepad',
    sku: 'MP-L-001',
    cost: 19,
    sellingPrice: 89,
    owner: 'yassir'
  },
  {
    id: 'pixel 16',
    name: 'pixel 16',
    sku: 'PIX-16-001',
    cost: 80,
    sellingPrice: 193,
    owner: 'basim'
  },
  {
    id: 'pixel 32',
    name: 'pixel 32',
    sku: 'PIX-32-001',
    cost: 95,
    sellingPrice: 248,
    owner: 'basim'
  },
  {
    id: 'pixel 64',
    name: 'pixel 64',
    sku: 'PIX-64-001',
    cost: 220,
    sellingPrice: 349,
    owner: 'basim'
  },
  {
    id: 'PC Light 24',
    name: 'PC Light 24',
    sku: 'PC-LIGHT-24',
    cost: 55,
    sellingPrice: 179,
    owner: 'basim'
  },
  {
    id: 'PC Light 27',
    name: 'PC Light 27',
    sku: 'PC-LIGHT-27',
    cost: 58,
    sellingPrice: 189,
    owner: 'basim'
  },
  {
    id: 'PC Light 32',
    name: 'PC Light 32',
    sku: 'PC-LIGHT-32',
    cost: 60,
    sellingPrice: 194,
    owner: 'basim'
  },
  {
    id: 'PC Light 34',
    name: 'PC Light 34',
    sku: 'PC-LIGHT-34',
    cost: 61,
    sellingPrice: 199,
    owner: 'basim'
  },
  {
    id: 'TV 24',
    name: 'TV 24',
    sku: 'TV-LIGHT-24',
    cost: 100,
    sellingPrice: 249,
    owner: 'basim'
  },
  {
    id: 'TV 27',
    name: 'TV 27',
    sku: 'TV-LIGHT-27',
    cost: 102,
    sellingPrice: 259,
    owner: 'basim'
  },
  {
    id: 'TV 32',
    name: 'TV 32',
    sku: 'TV-LIGHT-32',
    cost: 103,
    sellingPrice: 269,
    owner: 'basim'
  },
  {
    id: 'TV 34',
    name: 'TV 34',
    sku: 'TV-LIGHT-34',
    cost: 104,
    sellingPrice: 274,
    owner: 'basim'
  },
  {
    id: 'TV 40-50',
    name: 'TV 40-50',
    sku: 'TV-LIGHT-40-50',
    cost: 104,
    sellingPrice: 279,
    owner: 'basim'
  },
  {
    id: 'TV 55-65',
    name: 'TV 55-65',
    sku: 'TV-LIGHT-55-65',
    cost: 114,
    sellingPrice: 284,
    owner: 'basim'
  },
  {
    id: 'TV 75-85',
    name: 'TV 75-85',
    sku: 'TV-LIGHT-75-85',
    cost: 117,
    sellingPrice: 289,
    owner: 'basim'
  },
  {
    id: 'Smart Cube',
    name: 'Smart Cube',
    sku: 'SMT-CUBE-001',
    cost: 95,
    sellingPrice: 149,
    owner: 'basim'
  },
  {
    id: 'NEON ROPE',
    name: 'NEON ROPE',
    sku: 'NEO-ROPE-001',
    cost: 95,
    sellingPrice: 139,
    owner: 'basim'
  },
  {
    id: 'MUG',
    name: 'MUG',
    sku: 'MUG-001',
    cost: 19,
    sellingPrice: 47.4,
    owner: 'basim'
  },
];

export const getProducts = (): Product[] => {
  const savedProducts = localStorage.getItem('products');
  if (savedProducts) {
    const products = JSON.parse(savedProducts);
    // Migrate existing products to include SKU if missing
    return products.map((product: any) => ({
      ...product,
      sku: product.sku || generateSKU(product.name, product.id)
    }));
  }
  return defaultProducts;
};

export const saveProducts = (products: Product[]) => {
  localStorage.setItem('products', JSON.stringify(products));
};

// Helper function to generate SKU from product name
const generateSKU = (name: string, id: string): string => {
  const words = name.toUpperCase().split(' ');
  const prefix = words.map(word => word.substring(0, 3)).join('-');
  const suffix = id.substring(0, 3).toUpperCase();
  return `${prefix}-${suffix}`;
};

// Function to generate unique SKU
export const generateUniqueSKU = (name: string, existingProducts: Product[]): string => {
  const baseSKU = generateSKU(name, Date.now().toString());
  let counter = 1;
  let sku = baseSKU;
  
  while (existingProducts.some(p => p.sku === sku)) {
    sku = `${baseSKU}-${counter.toString().padStart(3, '0')}`;
    counter++;
  }
  
  return sku;
};
