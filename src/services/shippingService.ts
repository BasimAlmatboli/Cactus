import { supabase } from '../lib/supabase';
import { ShippingMethod } from '../types';

export const shippingService = {
  async getShippingMethods(): Promise<ShippingMethod[]> {
    const { data, error } = await supabase
      .from('shipping_methods')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching shipping methods:', error);
      throw error;
    }

    return data.map(method => ({
      id: method.id,
      name: method.name,
      cost: Number(method.cost),
      is_active: method.is_active,
    }));
  },

  async getActiveShippingMethods(): Promise<ShippingMethod[]> {
    const { data, error } = await supabase
      .from('shipping_methods')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching active shipping methods:', error);
      throw error;
    }

    return data.map(method => ({
      id: method.id,
      name: method.name,
      cost: Number(method.cost),
      is_active: method.is_active,
    }));
  },

  async createShippingMethod(name: string, cost: number): Promise<ShippingMethod> {
    const { data, error } = await supabase
      .from('shipping_methods')
      .insert([{ name, cost, is_active: true }])
      .select()
      .single();

    if (error) {
      console.error('Error creating shipping method:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      cost: Number(data.cost),
      is_active: data.is_active,
    };
  },

  async updateShippingMethod(id: string, updates: { name?: string; cost?: number }): Promise<void> {
    const { error } = await supabase
      .from('shipping_methods')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating shipping method:', error);
      throw error;
    }
  },

  async toggleShippingMethodStatus(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from('shipping_methods')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error toggling shipping method status:', error);
      throw error;
    }
  },

  async deleteShippingMethod(id: string): Promise<void> {
    const { error } = await supabase
      .from('shipping_methods')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting shipping method:', error);
      throw error;
    }
  },
};
