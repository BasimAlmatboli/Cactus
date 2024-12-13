import { Product } from '../types';

const defaultProducts: Product[] = [
  {
    id: 'rgb-light',
    name: 'Lines RGB Light',
    cost: 130,
    sellingPrice: 199,
  },
  {
    id: 'mousepad',
    name: 'Mousepad',
    cost: 16,
    sellingPrice: 79,
  },
  {
    id: 'smart-cube',
    name: 'Smart Cube',
    cost: 77,
    sellingPrice: 149,
  },
 {
    id: 'pixel-screen-16',
    name: 'pixel screen 16',
    cost: 80,
    sellingPrice: 193,
  },
 {
    id: 'pixel-screen-32',
    name: 'pixel screen 32',
    cost: 95,
    sellingPrice: 229,
  },
];

export const getProducts = (): Product[] => {
  const savedProducts = localStorage.getItem('products');
  return savedProducts ? JSON.parse(savedProducts) : defaultProducts;
};

export const saveProducts = (products: Product[]) => {
  localStorage.setItem('products', JSON.stringify(products));
};
