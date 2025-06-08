import { Lightbulb, Monitor, Cpu, Tv, Package } from 'lucide-react';

export const getProductCategory = (productName: string): string => {
  const name = productName.toLowerCase();
  
  if (name.includes('rgb light') || name.includes('lines rgb')) {
    return 'RGB Light';
  }
  
  if (name.includes('pixel')) {
    return 'Pixel Screen';
  }
  
  if (name.includes('pc light')) {
    return 'PC Light';
  }
  
  if (name.includes('tv')) {
    return 'TV Light';
  }
  
  return 'Other Products';
};

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'RGB Light':
      return Lightbulb;
    case 'Pixel Screen':
      return Monitor;
    case 'PC Light':
      return Cpu;
    case 'TV Light':
      return Tv;
    default:
      return Package;
  }
};

export const getCategoryDescription = (category: string): string => {
  switch (category) {
    case 'RGB Light':
      return 'Colorful LED lighting solutions';
    case 'Pixel Screen':
      return 'Digital display screens';
    case 'PC Light':
      return 'Computer lighting accessories';
    case 'TV Light':
      return 'Television backlighting';
    default:
      return 'Various products';
  }
};