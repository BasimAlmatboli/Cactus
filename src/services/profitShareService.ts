import { supabase } from '../lib/supabase';

/**
 * Profit Share Service
 * 
 * Manages profit sharing percentages stored in the database.
 * Each product has profit shares distributed among partners (Yassir and Basim).
 */

export interface Partner {
    id: string;
    name: string;
    display_name: string;
    is_active: boolean;
}

export interface ProductProfitShare {
    id: string;
    product_id: string;
    partner_id: string;
    share_percentage: number;
    partner?: Partner;
}

export interface ProfitSharesByProduct {
    [productId: string]: {
        [partnerName: string]: number; // percentage (0-100)
    };
}

/**
 * Get all partners
 */
export const getPartners = async (): Promise<Partner[]> => {
    const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('is_active', true)
        .order('name');

    if (error) {
        console.error('Error fetching partners:', error);
        throw error;
    }

    return data || [];
};

/**
 * Get profit shares for a specific product
 */
export const getProductProfitShares = async (productId: string): Promise<ProductProfitShare[]> => {
    const { data, error } = await supabase
        .from('product_profit_shares')
        .select(`
      *,
      partner:partners(id, name, display_name, is_active)
    `)
        .eq('product_id', productId);

    if (error) {
        console.error(`Error fetching profit shares for product ${productId}:`, error);
        throw error;
    }

    return data || [];
};

/**
 * Get all profit shares for all products
 * Returns a map of product_id -> partner_name -> percentage
 */
export const getAllProfitShares = async (): Promise<ProfitSharesByProduct> => {
    const { data, error } = await supabase
        .from('product_profit_shares')
        .select(`
      product_id,
      share_percentage,
      partner:partners(name)
    `);

    if (error) {
        console.error('Error fetching all profit shares:', error);
        throw error;
    }

    // Transform to nested object for easy lookup
    const shares: ProfitSharesByProduct = {};

    data?.forEach((share: any) => {
        const productId = share.product_id;
        const partnerName = share.partner.name;
        const percentage = Number(share.share_percentage);

        if (!shares[productId]) {
            shares[productId] = {};
        }
        shares[productId][partnerName] = percentage;
    });

    return shares;
};

/**
 * Calculate profit share for a specific product
 * @param productId - The product ID
 * @param netProfit - The net profit to be shared
 * @returns Object with each partner's share amount
 */
export const calculateProfitShareForProduct = async (
    productId: string,
    netProfit: number
): Promise<{ [partnerName: string]: number }> => {
    const shares = await getProductProfitShares(productId);

    const result: { [partnerName: string]: number } = {};

    shares.forEach(share => {
        if (share.partner) {
            const partnerName = share.partner.name;
            const percentage = Number(share.share_percentage) / 100;
            result[partnerName] = netProfit * percentage;
        }
    });

    return result;
};

/**
 * Cache for profit shares to avoid repeated database calls
 */
class ProfitShareCache {
    private cache: ProfitSharesByProduct | null = null;
    private cacheTime: number = 0;
    private readonly TTL = 300000; // 5 minutes cache

    async get(): Promise<ProfitSharesByProduct> {
        const now = Date.now();

        if (this.cache && (now - this.cacheTime) < this.TTL) {
            return this.cache;
        }

        this.cache = await getAllProfitShares();
        this.cacheTime = now;
        return this.cache;
    }

    clear(): void {
        this.cache = null;
        this.cacheTime = 0;
    }
}

export const profitShareCache = new ProfitShareCache();

/**
 * Get cached profit shares for all products
 */
export const getCachedProfitShares = async (): Promise<ProfitSharesByProduct> => {
    return profitShareCache.get();
};

/**
 * Calculate profit share using cached data
 * @param productId - The product ID
 * @param netProfit - The net profit to be shared
 * @returns Object with each partner's share amount
 */
export const calculateCachedProfitShare = async (
    productId: string,
    netProfit: number
): Promise<{ yassir: number; basim: number }> => {
    const allShares = await getCachedProfitShares();
    const productShares = allShares[productId];

    if (!productShares) {
        console.warn(`No profit shares found for product ${productId}, defaulting to Basim 100%`);
        return { yassir: 0, basim: netProfit };
    }

    return {
        yassir: netProfit * ((productShares.yassir || 0) / 100),
        basim: netProfit * ((productShares.basim || 0) / 100)
    };
};
