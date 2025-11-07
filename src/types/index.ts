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

export interface Offer {
  id: string;
  name: string;
  description?: string;
  triggerProductId: string;
  triggerProductName: string;
  targetProductId: string;
  targetProductName: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppliedOffer {
  offerId: string;
  offerName: string;
  triggerProductId: string;
  targetProductId: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
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
  appliedOffer?: AppliedOffer | null;
  total: number;
  netProfit: number;
  isFreeShipping: boolean;
}