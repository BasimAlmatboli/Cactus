import { Product } from '../types';

const defaultProducts: Product[] = [
  {
    id: 'rgb-light',
    name: 'Lines RGB Light',
    cost: 130,
    sellingPrice: 199,
    owner: 'yassir'  // Yassir's product
  },
  {
    id: 'mousepad',
    name: 'Mousepad',
    cost: 16,
    sellingPrice: 79,
    owner: 'yassir'  // Yassir's product
  },
  {
    id: 'smart-cube',
    name: 'Smart Cube',
    cost: 77,
    sellingPrice: 149,
    owner: 'basim'  // Basim's product
  }, 
  {
    id: 'pixel-screen-16',
    name: 'pixel screen 16',
    cost: 80,
    sellingPrice: 193,
    owner: 'basim'  // Basim's product
  },
  {
    id: 'pixel-screen-32',
    name: 'pixel screen 32',
    cost: 95,
    sellingPrice: 248,
    owner: 'basim'  // Basim's product
  },
  {
    id: 'ٍSmart-PC-Light',
    name: 'ٍSmart PC Light',
    cost: 85,
    sellingPrice: 179,
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
