import { supabase } from '../lib/supabase';

/**
 * System Settings Service
 * 
 * Manages system-wide configurable settings stored in the database.
 */

interface SystemSetting {
    id: string;
    setting_key: string;
    setting_value: string;
    setting_type: 'number' | 'string' | 'boolean' | 'json';
    description: string | null;
    category: string | null;
    is_editable: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * Parse setting value based on its type
 */
const parseSettingValue = (value: string, type: string): any => {
    switch (type) {
        case 'number':
            return Number(value);
        case 'boolean':
            return value === 'true';
        case 'json':
            return JSON.parse(value);
        case 'string':
        default:
            return value;
    }
};

/**
 * Get a setting value by key
 */
export const getSetting = async (key: string): Promise<any> => {
    const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('setting_key', key)
        .single();

    if (error) {
        console.error(`Error fetching setting ${key}:`, error);
        throw new Error(`Failed to fetch setting: ${key}`);
    }

    return parseSettingValue(data.setting_value, data.setting_type);
};

/**
 * Get free shipping threshold
 */
export const getFreeShippingThreshold = async (): Promise<number> => {
    return await getSetting('free_shipping_threshold');
};



/**
 * Get all settings by category
 */
export const getSettingsByCategory = async (category: string): Promise<SystemSetting[]> => {
    const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('category', category)
        .order('setting_key');

    if (error) {
        console.error(`Error fetching settings for category ${category}:`, error);
        throw error;
    }

    return data || [];
};

/**
 * Get all editable settings
 */
export const getAllEditableSettings = async (): Promise<SystemSetting[]> => {
    const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('is_editable', true)
        .order('category', { ascending: true })
        .order('setting_key', { ascending: true });

    if (error) {
        console.error('Error fetching editable settings:', error);
        throw error;
    }

    return data || [];
};

/**
 * Update a setting value
 */
export const updateSetting = async (key: string, value: any): Promise<void> => {
    // Convert value to string for storage
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

    const { error } = await supabase
        .from('system_settings')
        .update({ setting_value: stringValue })
        .eq('setting_key', key);

    if (error) {
        console.error(`Error updating setting ${key}:`, error);
        throw new Error(`Failed to update setting: ${key}`);
    }
};

/**
 * Update free shipping threshold
 */
export const updateFreeShippingThreshold = async (value: number): Promise<void> => {
    if (value < 0) {
        throw new Error('Free shipping threshold must be a positive number');
    }
    await updateSetting('free_shipping_threshold', value);
};



/**
 * Settings cache to avoid repeated database calls
 */
class SettingsCache {
    private cache: Map<string, { value: any; timestamp: number }> = new Map();
    private readonly TTL = 60000; // 1 minute cache

    async get(key: string, fetchFn: () => Promise<any>): Promise<any> {
        const cached = this.cache.get(key);
        const now = Date.now();

        if (cached && (now - cached.timestamp) < this.TTL) {
            return cached.value;
        }

        const value = await fetchFn();
        this.cache.set(key, { value, timestamp: now });
        return value;
    }

    clear(key?: string): void {
        if (key) {
            this.cache.delete(key);
        } else {
            this.cache.clear();
        }
    }
}

export const settingsCache = new SettingsCache();

/**
 * Get free shipping threshold with caching
 */
export const getCachedFreeShippingThreshold = async (): Promise<number> => {
    return settingsCache.get('free_shipping_threshold', getFreeShippingThreshold);
};


