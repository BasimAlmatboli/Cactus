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
  total: number;
  net_profit: number;
  is_free_shipping: boolean;
}

export interface Database {
  public: {
    Tables: {
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