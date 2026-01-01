import { Product } from '../types';
import { supabase } from '../lib/supabase';

/**
 * Product Service - Database Layer
 * 
 * This service handles all product-related database operations.
 * It replaces the localStorage-based product management with Supabase.
 */

// Database column names use snake_case, TypeScript uses camelCase
interface ProductRow {
    id: string;
    name: string;
    sku: string;
    cost: number;
    selling_price: number;
    owner: 'yassir' | 'basim';
    category: string | null;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * Transform database row to Product type
 */
const transformProductRow = (row: ProductRow): Product => ({
    id: row.id,
    name: row.name,
    sku: row.sku,
    cost: Number(row.cost),
    sellingPrice: Number(row.selling_price),
    owner: row.owner,
});

/**
 * Transform Product to database row
 */
const transformProductToRow = (product: Product): Partial<ProductRow> => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    cost: product.cost,
    selling_price: product.sellingPrice,
    owner: product.owner,
});

/**
 * Get all active products from database
 */
export const getProducts = async (): Promise<Product[]> => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching products:', error);
        throw new Error(`Failed to fetch products: ${error.message}`);
    }

    return (data || []).map(transformProductRow);
};

/**
 * Get all products including inactive ones (for admin)
 */
export const getAllProducts = async (): Promise<Product[]> => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching all products:', error);
        throw new Error(`Failed to fetch all products: ${error.message}`);
    }

    return (data || []).map(transformProductRow);
};

/**
 * Get a single product by ID
 */
export const getProductById = async (id: string): Promise<Product | null> => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            // Not found
            return null;
        }
        console.error('Error fetching product:', error);
        throw new Error(`Failed to fetch product: ${error.message}`);
    }

    return data ? transformProductRow(data) : null;
};

/**
 * Get products by owner
 */
export const getProductsByOwner = async (owner: 'yassir' | 'basim'): Promise<Product[]> => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('owner', owner)
        .eq('is_active', true)
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching products by owner:', error);
        throw new Error(`Failed to fetch products by owner: ${error.message}`);
    }

    return (data || []).map(transformProductRow);
};

/**
 * Create a new product
 */
export const createProduct = async (product: Product): Promise<Product> => {
    const productRow = transformProductToRow(product);

    const { data, error } = await supabase
        .from('products')
        .insert(productRow as any)
        .select()
        .single();

    if (error) {
        console.error('Error creating product:', error);
        throw new Error(`Failed to create product: ${error.message}`);
    }

    return transformProductRow(data);
};

/**
 * Update an existing product
 */
export const updateProduct = async (
    id: string,
    updates: Partial<Product>
): Promise<Product> => {
    const productRow: Partial<ProductRow> = {};

    if (updates.name !== undefined) productRow.name = updates.name;
    if (updates.sku !== undefined) productRow.sku = updates.sku;
    if (updates.cost !== undefined) productRow.cost = updates.cost;
    if (updates.sellingPrice !== undefined) productRow.selling_price = updates.sellingPrice;
    if (updates.owner !== undefined) productRow.owner = updates.owner;

    const { data, error } = await supabase
        .from('products')
        .update(productRow as any)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating product:', error);
        throw new Error(`Failed to update product: ${error.message}`);
    }

    return transformProductRow(data);
};

/**
 * Delete a product (soft delete by setting is_active to false)
 */
export const deleteProduct = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('products')
        .update({ is_active: false } as any)
        .eq('id', id);

    if (error) {
        console.error('Error deleting product:', error);
        throw new Error(`Failed to delete product: ${error.message}`);
    }
};

/**
 * Permanently delete a product (hard delete)
 */
export const permanentlyDeleteProduct = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error permanently deleting product:', error);
        throw new Error(`Failed to permanently delete product: ${error.message}`);
    }
};

/**
 * Restore a soft-deleted product
 */
export const restoreProduct = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('products')
        .update({ is_active: true } as any)
        .eq('id', id);

    if (error) {
        console.error('Error restoring product:', error);
        throw new Error(`Failed to restore product: ${error.message}`);
    }
};

/**
 * Check if a SKU already exists
 */
export const checkSkuExists = async (sku: string, excludeId?: string): Promise<boolean> => {
    let query = supabase
        .from('products')
        .select('id')
        .eq('sku', sku);

    if (excludeId) {
        query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error checking SKU:', error);
        return false;
    }

    return (data || []).length > 0;
};
