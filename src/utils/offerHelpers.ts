import { Offer, OrderItem, AppliedOffer } from '../types';

/**
 * Check if an offer is currently valid based on date constraints
 */
export const isOfferValid = (offer: Offer): boolean => {
  if (!offer.isActive) {
    return false;
  }

  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // Check start date
  if (offer.startDate) {
    if (today < offer.startDate) {
      return false;
    }
  }

  // Check end date
  if (offer.endDate) {
    if (today > offer.endDate) {
      return false;
    }
  }

  return true;
};

/**
 * Find applicable offers based on current order items
 * Returns all valid offers where the trigger product is in the cart
 */
export const findApplicableOffers = (
  orderItems: OrderItem[],
  offers: Offer[]
): Offer[] => {
  const productIds = orderItems.map(item => item.product.id);

  return offers.filter(offer => {
    // Check if offer is valid
    if (!isOfferValid(offer)) {
      return false;
    }

    // Check if trigger product is in the cart
    return productIds.includes(offer.triggerProductId);
  });
};

/**
 * Calculate the discount amount for a specific offer on a target product
 */
export const calculateOfferDiscount = (
  offer: Offer,
  originalPrice: number
): number => {
  if (offer.discountType === 'percentage') {
    return (originalPrice * offer.discountValue) / 100;
  } else {
    // Fixed discount
    return Math.min(offer.discountValue, originalPrice);
  }
};

/**
 * Apply offer to order items and return the applied offer details
 */
export const applyOfferToItems = (
  orderItems: OrderItem[],
  offer: Offer
): { appliedOffer: AppliedOffer | null } => {
  const targetItem = orderItems.find(item => item.product.id === offer.targetProductId);

  if (!targetItem) {
    return { appliedOffer: null };
  }

  const originalPrice = targetItem.product.sellingPrice;
  const discountAmount = calculateOfferDiscount(offer, originalPrice) * targetItem.quantity;

  const appliedOffer: AppliedOffer = {
    offerId: offer.id,
    offerName: offer.name,
    triggerProductId: offer.triggerProductId,
    targetProductId: offer.targetProductId,
    discountType: offer.discountType,
    discountValue: offer.discountValue,
    discountAmount: discountAmount
  };

  return { appliedOffer };
};

/**
 * Get the best offer from multiple applicable offers
 * Returns the offer that provides the highest discount
 */
export const getBestOffer = (
  orderItems: OrderItem[],
  applicableOffers: Offer[]
): Offer | null => {
  if (applicableOffers.length === 0) {
    return null;
  }

  let bestOffer: Offer | null = null;
  let maxDiscount = 0;

  applicableOffers.forEach(offer => {
    const targetItem = orderItems.find(item => item.product.id === offer.targetProductId);
    if (targetItem) {
      const discount = calculateOfferDiscount(offer, targetItem.product.sellingPrice);
      if (discount > maxDiscount) {
        maxDiscount = discount;
        bestOffer = offer;
      }
    }
  });

  return bestOffer;
};
