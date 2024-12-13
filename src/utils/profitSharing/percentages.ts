/**
 * Defines the profit sharing percentages for different products
 */

export const getYassirPercentage = (productName: string): number => {
  switch (productName) {
    case 'Lines RGB Light':
      return 0.9; // 90%
    case 'Mousepad':
      return 0.7; // 70%
    case 'Smart Cube':
      return 0.1; // 10%
    case 'pixel screen 16':
        return 0.1; // 10%
    case 'pixel screen 32':
        return 0.1; // 10%
    default:
      return 1; // 100%
  }
};

export const getBasimPercentage = (productName: string): number => {
  return 1 - getYassirPercentage(productName);
};