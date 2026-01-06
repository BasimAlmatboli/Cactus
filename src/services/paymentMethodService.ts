import { supabase } from '../lib/supabase';
import type { PaymentMethod } from '../types';

/**
 * Fetch all payment methods from database
 * @param activeOnly - If true, only return active payment methods
 */
export async function fetchPaymentMethods(activeOnly: boolean = true): Promise<PaymentMethod[]> {
    let query = supabase
        .from('payment_methods')
        .select('*')
        .order('display_order');

    if (activeOnly) {
        query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
}

/**
 * Fetch single payment method by ID
 */
export async function getPaymentMethodById(id: string): Promise<PaymentMethod | null> {
    const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
    }

    return data;
}

/**
 * Create new payment method
 */
export async function createPaymentMethod(data: {
    name: string;
    fee_percentage: number;
    fee_fixed: number;
    tax_rate: number;
    customer_fee: number;
    display_order?: number;
}): Promise<PaymentMethod> {
    const { data: result, error } = await supabase
        .from('payment_methods')
        .insert({
            name: data.name,
            fee_percentage: data.fee_percentage,
            fee_fixed: data.fee_fixed,
            tax_rate: data.tax_rate,
            customer_fee: data.customer_fee,
            display_order: data.display_order || 0,
            is_active: true,
        })
        .select()
        .single();

    if (error) throw error;
    return result;
}

/**
 * Update existing payment method
 */
export async function updatePaymentMethod(
    id: string,
    updates: Partial<Omit<PaymentMethod, 'id' | 'created_at' | 'updated_at'>>
): Promise<void> {
    const { error } = await supabase
        .from('payment_methods')
        .update(updates)
        .eq('id', id);

    if (error) throw error;
}

/**
 * Delete payment method
 */
export async function deletePaymentMethod(id: string): Promise<void> {
    const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

/**
 * Toggle payment method active status
 */
export async function togglePaymentMethodStatus(id: string): Promise<void> {
    // First get current status
    const method = await getPaymentMethodById(id);
    if (!method) throw new Error('Payment method not found');

    // Toggle status
    await updatePaymentMethod(id, { is_active: !method.is_active });
}

/**
 * Calculate payment fees using payment method configuration
 */
export function calculatePaymentFeesFromMethod(paymentMethod: PaymentMethod, amount: number): number {
    const paymentGatewayFee = amount * (paymentMethod.fee_percentage / 100);
    const baseFees = paymentGatewayFee + paymentMethod.fee_fixed;
    const feesTax = baseFees * (paymentMethod.tax_rate / 100);
    return baseFees + feesTax;
}
