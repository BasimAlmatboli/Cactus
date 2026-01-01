import { useState, useEffect } from 'react';
import { getCachedFreeShippingThreshold } from '../services/settingsService';

/**
 * Hook to get the free shipping threshold from database
 * Returns the threshold value with caching
 */
export const useFreeShippingThreshold = () => {
    const [threshold, setThreshold] = useState<number>(300); // Default fallback
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadThreshold = async () => {
            try {
                const value = await getCachedFreeShippingThreshold();
                setThreshold(value);
            } catch (error) {
                console.error('Error loading free shipping threshold:', error);
                // Keep default value on error
            } finally {
                setIsLoading(false);
            }
        };

        loadThreshold();
    }, []);

    return { threshold, isLoading };
};
