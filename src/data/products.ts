import { Product } from '../types';

const defaultProducts: Product[] = [
  {
    id: 'Old RGB Light',
    name: 'Old RGB Light',
    cost: 130,
    sellingPrice: 199,
    owner: 'yassir'  // Yassir's product
  },
  {
    id: 'New RGB Light',
    name: 'New RGB Light',
    cost: 130,
    sellingPrice: 215,
    owner: 'yassir'  // Yassir's product
  },
  {
    id: 'Mousepad',
    name: 'Mousepad',
    cost: 16,
    sellingPrice: 79,
    owner: 'yassir'  // Yassir's product
  },
  {
    id: 'pixel 16',
    name: 'pixel 16',
    cost: 80,
    sellingPrice: 193,
    owner: 'basim'  // Basim's product
  },
  {
    id: 'pixel 32',
    name: 'pixel 32',
    cost: 95,
    sellingPrice: 248,
    owner: 'basim'  // Basim's product
  },
 {
    id: 'pixel 64',
    name: 'pixel 64',
    cost: 220,
    sellingPrice: 349,
    owner: 'basim'  // Basim's product
  },
  {
    id: 'PC Light 24',
    name: 'PC Light 24',
    cost: 55,
    sellingPrice: 179,
    owner: 'basim'  // Basim's product
  },
  {
    id: 'PC Light 27',
    name: 'PC Light 27',
    cost: 58,
    sellingPrice: 189,
    owner: 'basim'  // Basim's product
  },
  {
    id: 'PC Light 32',
    name: 'PC Light 32',
    cost: 60,
    sellingPrice: 194,
    owner: 'basim'  // Basim's product
  },
  {
    id: 'PC Light 34',
    name: 'PC Light 34',
    cost: 61,
    sellingPrice: 199,
    owner: 'basim'  // Basim's product
  },

  {
    id: 'Smart Cube',
    name: 'Smart Cube',
    cost: 77,
    sellingPrice: 149,
    owner: 'basim'  // Basim's product
  }, 
  {
    id: 'NEON ROPE',
    name: 'NEON ROPE',
    cost: 95,
    sellingPrice: 139,
    owner: 'basim'  // Basim's product
  },
];

export const getProducts = (): Product[] => {
  const savedProducts = localStorage.getItem('products');
  return savedProducts ? JSON.parse(savedProducts) : defaultProducts;
};

export const saveProducts = (products: Product[]) => {
  localStorage.setItem('products', JSON.stringify(products));
};
