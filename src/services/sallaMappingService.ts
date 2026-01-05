import { supabase } from '../lib/supabase';
import type {
    SallaProductMapping,
    SallaShippingMapping,
    SallaPaymentMapping,
    Product,
    ShippingMethod,
    PaymentMethod,
} from '../types';

/**
 * Fetch all product mappings from database
 */
export async function fetchProductMappings(): Promise<SallaProductMapping[]> {
    const { data, error } = await supabase
        .from('salla_product_mappings')
        .select('*')
        .order('salla_product_name');

    if (error) throw error;
    return data || [];
}

/**
 * Fetch all shipping mappings from database
 */
export async function fetchShippingMappings(): Promise<SallaShippingMapping[]> {
    const { data, error } = await supabase
        .from('salla_shipping_mappings')
        .select('*');

    if (error) throw error;
    return data || [];
}

/**
 * Fetch all payment mappings from database
 */
export async function fetchPaymentMappings(): Promise<SallaPaymentMapping[]> {
    const { data, error } = await supabase
        .from('salla_payment_mappings')
        .select('*');

    if (error) throw error;
    return data || [];
}

/**
 * Add new product mapping
 */
export async function addProductMapping(
    sallaProductName: string,
    sallaSku: string | null,
    systemProductId: string
): Promise<SallaProductMapping> {
    const { data, error } = await supabase
        .from('salla_product_mappings')
        .insert({
            salla_product_name: sallaProductName,
            salla_sku: sallaSku,
            system_product_id: systemProductId,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Update existing product mapping
 */
export async function updateProductMapping(
    id: string,
    systemProductId: string
): Promise<void> {
    const { error } = await supabase
        .from('salla_product_mappings')
        .update({ system_product_id: systemProductId })
        .eq('id', id);

    if (error) throw error;
}

/**
 * Delete product mapping
 */
export async function deleteProductMapping(id: string): Promise<void> {
    const { error } = await supabase
        .from('salla_product_mappings')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

/**
 * Add new shipping mapping
 */
export async function addShippingMapping(
    sallaShippingName: string,
    systemShippingMethodId: string
): Promise<void> {
    const { error } = await supabase
        .from('salla_shipping_mappings')
        .insert({
            salla_shipping_name: sallaShippingName,
            system_shipping_method_id: systemShippingMethodId,
        });

    if (error) throw error;
}

/**
 * Delete shipping mapping
 */
export async function deleteShippingMapping(id: string): Promise<void> {
    const { error } = await supabase
        .from('salla_shipping_mappings')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

/**
 * Add new payment mapping
 */
export async function addPaymentMapping(
    sallaPaymentName: string,
    systemPaymentMethodId: string
): Promise<void> {
    const { error } = await supabase
        .from('salla_payment_mappings')
        .insert({
            salla_payment_name: sallaPaymentName,
            system_payment_method_id: systemPaymentMethodId,
        });

    if (error) throw error;
}

/**
 * Delete payment mapping
 */
export async function deletePaymentMapping(id: string): Promise<void> {
    const { error } = await supabase
        .from('salla_payment_mappings')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

/**
 * Look up system product by Salla product name
 */
export async function lookupProductByName(sallaProductName: string): Promise<Product | null> {
    // First get mapping
    const { data: mapping, error: mappingError } = await supabase
        .from('salla_product_mappings')
        .select('system_product_id')
        .eq('salla_product_name', sallaProductName)
        .single();

    if (mappingError || !mapping) return null;

    // Then fetch product details
    const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', mapping.system_product_id)
        .single();

    if (productError || !product) return null;

    return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        cost: parseFloat(product.cost),
        sellingPrice: parseFloat(product.selling_price),
        owner: product.owner,
    };
}

/**
 * Look up shipping method by Salla shipping name
 */
export async function lookupShippingMethod(sallaShippingName: string): Promise<ShippingMethod | null> {
    // First get mapping
    const { data: mapping, error: mappingError } = await supabase
        .from('salla_shipping_mappings')
        .select('system_shipping_method_id')
        .eq('salla_shipping_name', sallaShippingName)
        .single();

    if (mappingError || !mapping) return null;

    // Then fetch shipping method details
    const { data: method, error: methodError } = await supabase
        .from('shipping_methods')
        .select('*')
        .eq('id', mapping.system_shipping_method_id)
        .single();

    if (methodError || !method) return null;

    return {
        id: method.id,
        name: method.name,
        cost: parseFloat(method.cost),
        is_active: method.is_active,
    };
}

/**
 * Look up payment method by Salla payment name  
 */
export async function lookupPaymentMethod(sallaPaymentName: string): Promise<PaymentMethod | null> {
    // First get mapping
    const { data: mapping, error: mappingError } = await supabase
        .from('salla_payment_mappings')
        .select('system_payment_method_id')
        .eq('salla_payment_name', sallaPaymentName)
        .single();

    if (mappingError || !mapping) return null;

    // Then fetch complete payment method details from database
    const { data: method, error: methodError } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('id', mapping.system_payment_method_id)
        .single();

    if (methodError || !method) return null;

    // Return complete payment method object with all required fields
    return {
        id: method.id,
        name: method.name,
        fee_percentage: parseFloat(method.fee_percentage) || 0,
        fee_fixed: parseFloat(method.fee_fixed) || 0,
        tax_rate: parseFloat(method.tax_rate) || 0,
        customer_fee: parseFloat(method.customer_fee) || 0,
        display_order: method.display_order || 0,
        is_active: method.is_active !== false,
    };
}
