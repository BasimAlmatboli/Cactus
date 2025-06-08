import { Product } from '../types';

const defaultProducts: Product[] = [
  {
    id: 'Old RGB Light',
    name: 'Old RGB Light',
    sku: 'RGB-OLD-001',
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
    sku: 'ACC-MP-001',
    cost: 16,
    sellingPrice: 79,
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
    sku: 'PCL-24-001',
    cost: 55,
    sellingPrice: 179,
    owner: 'basim'
  },
  {
    id: 'PC Light 27',
    name: 'PC Light 27',
    sku: 'PCL-27-001',
    cost: 58,
    sellingPrice: 189,
    owner: 'basim'
  },
  {
    id: 'PC Light 32',
    name: 'PC Light 32',
    sku: 'PCL-32-001',
    cost: 60,
    sellingPrice: 194,
    owner: 'basim'
  },
  {
    id: 'PC Light 34',
    name: 'PC Light 34',
    sku: 'PCL-34-001',
    cost: 61,
    sellingPrice: 199,
    owner: 'basim'
  },
  {
    id: 'TV 24',
    name: 'TV 24',
    sku: 'TVL-24-001',
    cost: 100,
    sellingPrice: 249,
    owner: 'basim'
  },
  {
    id: 'TV 27',
    name: 'TV 27',
    sku: 'TVL-27-001',
    cost: 102,
    sellingPrice: 259,
    owner: 'basim'
  },
  {
    id: 'TV 32',
    name: 'TV 32',
    sku: 'TVL-32-001',
    cost: 103,
    sellingPrice: 269,
    owner: 'basim'
  },
  {
    id: 'TV 40-50',
    name: 'TV 40-50',
    sku: 'TVL-4050-001',
    cost: 104,
    sellingPrice: 274,
    owner: 'basim'
  },
  {
    id: 'TV 55-65',
    name: 'TV 55-65',
    sku: 'TVL-5565-001',
    cost: 114,
    sellingPrice: 284,
    owner: 'basim'
  },
  {
    id: 'TV 75-85',
    name: 'TV 75-85',
    sku: 'TVL-7585-001',
    cost: 117,
    sellingPrice: 289,
    owner: 'basim'
  },
  {
    id: 'Smart Cube',
    name: 'Smart Cube',
    sku: 'SMT-CUBE-001',
    cost: 77,
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