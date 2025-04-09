import { ShippingMethod } from '../types';

const defaultShippingMethods: ShippingMethod[] = [
  {
    id: 'redbox',
    name: 'Redbox',
    cost: 15,
  },
  {
    id: 'smsa-eco',
    name: 'SMSA-Eco',
    cost: 19,
  },
  {
    id: 'smsa',
    name: 'SMSA',
    cost: 27,
  },
];

export const getShippingMethods = (): ShippingMethod[] => {
  const savedMethods = localStorage.getItem('shippingMethods');
  return savedMethods ? JSON.parse(savedMethods) : defaultShippingMethods;
};

export const saveShippingMethods = (methods: ShippingMethod[]) => {
  localStorage.setItem('shippingMethods', JSON.stringify(methods));
};