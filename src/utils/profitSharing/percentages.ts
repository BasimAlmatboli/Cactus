/**
 * Defines the profit sharing percentages for different products
 */

export const getYassirPercentage = (productName: string): number => {
  switch (productName) {
    case 'Old RGB Light':
      return 0.9; // 90%
    case 'New RGB Light':
      return 0.9; // 90%
    case 'Mousepad':
      return 0.7; // 70%
    case 'Smart Cube':
      return 0.1; // 10%
    case 'pixel 16':
      return 0.2; // 20%
    case 'pixel 32':
      return 0.2; // 20%
    case 'pixel 64':
      return 0.2; // 20%
    case 'PC Light 24':
      return 0.2; // 20%
    case 'PC Light 27':
      return 0.2; // 20%
    case 'PC Light 32':
      return 0.2; // 20%
    case 'PC Light 34':
      return 0.2; // 20%
    case 'NEON ROPE':
      return 0.2; // 20%
    case 'TV 24':
      return 0.2; // 20%
    case 'TV 27':
      return 0.2; // 20%
    case 'TV 32':
      return 0.2; // 20%
    case 'TV 34':
      return 0.2; // 20%
    case 'TV 40-50':
      return 0.2; // 20%
    case 'TV 55-65':
      return 0.2; // 20%
    case 'TV 75-85':
      return 0.2; // 20%
    case 'MUG':
      return 0.3; // 30%

    default:
      return 0; // 0%
  }
};

export const getBasimPercentage = (productName: string): number => {
  return 1 - getYassirPercentage(productName);
};
