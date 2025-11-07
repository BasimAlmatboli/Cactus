export interface SupabaseShippingMethod {
  id: string;
  name: string;
  cost: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupabaseOffer {
  id: string;
  name: string;
  description: string;
  trigger_product_id: string;
  trigger_product_name: string;
  target_product_id: string;
  target_product_name: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupabaseOrder {
  id: string;
  order_number: string;
  customer_name?: string;
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
  };
  payment_method: {
    id: string;
    name: string;
  };
  subtotal: number;
  shipping_cost: number;
  payment_fees: number;
  discount: {
    type: 'percentage' | 'fixed';
    value: number;
    code?: string;
  } | null;
  applied_offer: {
    offerId: string;
    offerName: string;
    triggerProductId: string;
    targetProductId: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    discountAmount: number;
  } | null;
  total: number;
  net_profit: number;
  is_free_shipping: boolean;
}

export interface Database {
  public: {
    Tables: {
      shipping_methods: {
        Row: SupabaseShippingMethod;
        Insert: Omit<SupabaseShippingMethod, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SupabaseShippingMethod, 'id' | 'created_at' | 'updated_at'>>;
      };
      offers: {
        Row: SupabaseOffer;
        Insert: Omit<SupabaseOffer, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SupabaseOffer, 'id' | 'created_at' | 'updated_at'>>;
      };
      orders: {
        Row: SupabaseOrder & {
          created_at: string;
        };
        Insert: Omit<SupabaseOrder, 'created_at'>;
        Update: Partial<Omit<SupabaseOrder, 'created_at'>>;
      };
    };
  };
}