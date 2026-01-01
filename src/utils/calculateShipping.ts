import { getCachedFreeShippingThreshold } from '../services/settingsService';

/**
 * Calculate shipping display information
 * @param subtotal - Order subtotal
 * @param shippingCost - Base shipping cost
 * @param threshold - Free shipping threshold (optional, will fetch from DB if not provided)
 */
export const calculateShippingDisplay = async (
  subtotal: number,
  shippingCost: number,
  threshold?: number
) => {
  const freeShippingThreshold = threshold ?? await getCachedFreeShippingThreshold();
  const isFreeShipping = subtotal >= freeShippingThreshold;

  return {
    displayCost: isFreeShipping ? 0 : shippingCost,
    actualCost: shippingCost,
    isFreeShipping
  };
};