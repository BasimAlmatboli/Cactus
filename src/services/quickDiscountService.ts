import { supabase } from '../lib/supabase';
import { QuickDiscount } from '../types';
import type { SupabaseQuickDiscount } from '../types/supabase';

/**
 * Transform Supabase data to app format
 */
const transformQuickDiscount = (data: SupabaseQuickDiscount): QuickDiscount => ({
    id: data.id,
    name: data.name,
    type: data.type,
    value: data.value,
    displayOrder: data.display_order,
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
});

/**
 * Get all quick discounts or only active ones
 * @param activeOnly - If true, returns only active discounts
 */
export const getQuickDiscounts = async (activeOnly = false): Promise<QuickDiscount[]> => {
    let query = supabase
        .from('quick_discounts')
        .select('*')
        .order('display_order', { ascending: true });

    if (activeOnly) {
        query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(transformQuickDiscount);
};

/**
 * Create a new quick discount
 */
export const createQuickDiscount = async (
    discount: Omit<QuickDiscount, 'id' | 'createdAt' | 'updatedAt'>
): Promise<QuickDiscount> => {
    const { data, error } = await supabase
        .from('quick_discounts')
        .insert({
            name: discount.name,
            type: discount.type,
            value: discount.value,
            display_order: discount.displayOrder,
            is_active: discount.isActive,
        })
        .select()
        .single();

    if (error) throw error;
    return transformQuickDiscount(data);
};

/**
 * Update an existing quick discount
 */
export const updateQuickDiscount = async (
    id: string,
    updates: Partial<Omit<QuickDiscount, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<QuickDiscount> => {
    const supabaseUpdates: any = {};
    if (updates.name !== undefined) supabaseUpdates.name = updates.name;
    if (updates.type !== undefined) supabaseUpdates.type = updates.type;
    if (updates.value !== undefined) supabaseUpdates.value = updates.value;
    if (updates.displayOrder !== undefined) supabaseUpdates.display_order = updates.displayOrder;
    if (updates.isActive !== undefined) supabaseUpdates.is_active = updates.isActive;

    const { data, error } = await supabase
        .from('quick_discounts')
        .update(supabaseUpdates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return transformQuickDiscount(data);
};

/**
 * Delete a quick discount
 */
export const deleteQuickDiscount = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('quick_discounts')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

/**
 * Reorder multiple quick discounts
 */
export const reorderQuickDiscounts = async (
    discounts: { id: string; displayOrder: number }[]
): Promise<void> => {
    const updates = discounts.map(({ id, displayOrder }) =>
        supabase
            .from('quick_discounts')
            .update({ display_order: displayOrder })
            .eq('id', id)
    );

    await Promise.all(updates);
};
