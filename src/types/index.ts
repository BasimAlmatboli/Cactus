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
  id: string;  // Changed from hardcoded union to UUID string
  name: string;
  fee_percentage: number;
  fee_fixed: number;
  tax_rate: number;
  customer_fee: number;  // Fee charged TO customer (e.g., 10 SAR COD fee)
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
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

// ================================
// Salla Import Types
// ================================

export interface SallaProductMapping {
  id: string;
  salla_product_name: string;
  salla_sku: string | null;
  system_product_id: string;
  created_at: string;
  updated_at: string;
}

export interface SallaShippingMapping {
  id: string;
  salla_shipping_name: string;
  system_shipping_method_id: string;
  created_at: string;
}

export interface SallaPaymentMapping {
  id: string;
  salla_payment_name: string;
  system_payment_method_id: string;
  created_at: string;
}

export interface SallaOrder {
  orderDate: Date;
  orderNumber: string;
  customerName: string;
  cartSubtotal: number;
  discount: number;
  shippingCost: number;
  paymentMethod: string;
  codCommission: number;
  orderTotal: number;
  shippingCompany: string;
  products: SallaProduct[];
}

export interface SallaProduct {
  name: string;
  sku: string;
  quantity: number;
}

export interface ProductMatchResult {
  sallaProduct: SallaProduct;
  matchedProduct: Product | null;
  confidence: number; // 0-100
}

export interface MappedSallaOrder {
  sallaOrder: SallaOrder;
  productMatches: ProductMatchResult[];
  shippingMatch: ShippingMethod | null;
  paymentMatch: PaymentMethod | null;
  hasUnmappedProducts: boolean;
  warnings: string[];
}

export interface SallaImportPreview {
  orders: MappedSallaOrder[];
  totalOrders: number;
  totalMappedProducts: number;
  totalUnmappedProducts: number;
  uniqueUnmappedProducts: string[]; // Unique product names that need mapping
}

export interface SallaImportResult {
  success: boolean;
  importedCount: number;
  failedCount: number;
  errors: string[];
}
