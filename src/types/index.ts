export interface Product {
  id: string;
  name: string;
  sku: string;
  cost: number;
  sellingPrice: number;
  owner: 'yassir' | 'basim';
}

export interface ShippingMethod {
  id: string;
  name: string;
  cost: number;
  is_active: boolean;
}

export interface PaymentMethod {
  id: 'mada' | 'visa' | 'tamara';
  name: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
}

export interface Discount {
  type: 'percentage' | 'fixed';
  value: number;
  code?: string;
}

export interface QuickDiscount {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}


export interface Order {
  id: string;
  orderNumber: string;
  customerName?: string;
  date: string;
  items: OrderItem[];
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  subtotal: number;
  shippingCost: number;
  paymentFees: number;
  discount: Discount | null;
  total: number;
  netProfit: number;
  isFreeShipping: boolean;
}