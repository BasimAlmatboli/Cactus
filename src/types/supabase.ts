export interface SupabaseShippingMethod {
  id: string;
  name: string;
  cost: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}


export interface SupabaseOrder {
  id: string;
  order_number: string;
  customer_name?: string;
  created_at: string;  // ✅ Added to match database schema
  items: {
    product: {
      id: string;
      name: string;
      cost: number;
      sellingPrice: number;
    };
    quantity: number;
  }[];
  shipping_method: {
    id: string;
    name: string;
    cost: number;
    [key: string]: any; // Allow extra fields like is_active
  };
  payment_method: {
    id: string;
    name: string;
    [key: string]: any; // Allow extra fields like fees
  };
  subtotal: number;
  shipping_cost: number;
  payment_fees: number;
  discount: {
    type: 'percentage' | 'fixed';
    value: number;
    code?: string;
  } | null;
  total: number;
  net_profit: number;
  is_free_shipping: boolean;
}

export interface SupabaseQuickDiscount {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupabasePaymentMethod {
  id: string;
  name: string;
  fee_percentage: number;
  fee_fixed: number;
  tax_rate: number;
  customer_fee: number;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Database {
  public: {
    Tables: {
      shipping_methods: {
        Row: SupabaseShippingMethod;
        Insert: Omit<SupabaseShippingMethod, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SupabaseShippingMethod, 'id' | 'created_at' | 'updated_at'>>;
      };
      payment_methods: {
        Row: SupabasePaymentMethod;
        Insert: Omit<SupabasePaymentMethod, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SupabasePaymentMethod, 'created_at' | 'updated_at'>>;
      };
      orders: {
        Row: SupabaseOrder & {
          created_at: string;
        };
        Insert: Omit<SupabaseOrder, 'created_at'>;
        Update: Partial<Omit<SupabaseOrder, 'created_at'>>;
      };
      quick_discounts: {
        Row: SupabaseQuickDiscount;
        Insert: Omit<SupabaseQuickDiscount, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SupabaseQuickDiscount, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}