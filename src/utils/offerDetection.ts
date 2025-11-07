import { Offer, OrderItem, AppliedOffer } from '../types';

export const isOfferActive = (offer: Offer): boolean => {
  if (!offer.isActive) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (offer.startDate) {
    const startDate = new Date(offer.startDate);
    startDate.setHours(0, 0, 0, 0);
    if (today < startDate) {
      return false;
    }
  }

  if (offer.endDate) {
    const endDate = new Date(offer.endDate);
    endDate.setHours(0, 0, 0, 0);
    if (today > endDate) {
      return false;
    }
  }

  return true;
};

export const calculateOfferDiscount = (
  targetProductPrice: number,
  offer: Offer
): number => {
  let discountAmount = 0;

  if (offer.discountType === 'percentage') {
    discountAmount = (targetProductPrice * offer.discountValue) / 100;
  } else {
    discountAmount = offer.discountValue;
  }

  return Math.min(discountAmount, targetProductPrice);
};

export const findApplicableOffers = (
  orderItems: OrderItem[],
  availableOffers: Offer[]
): Offer[] => {
  const triggerProductIds = new Set(
    orderItems.map(item => item.product.id)
  );

  const applicableOffers = availableOffers.filter(offer => {
    if (!isOfferActive(offer)) {
      return false;
    }

    const hasTriggerProduct = triggerProductIds.has(offer.triggerProductId);
    const hasTargetProduct = triggerProductIds.has(offer.targetProductId);

    return hasTriggerProduct && hasTargetProduct;
  });

  return applicableOffers;
};

export const selectBestOffer = (
  targetProductPrice: number,
  applicableOffers: Offer[]
): Offer | null => {
  if (applicableOffers.length === 0) {
    return null;
  }

  let bestOffer = applicableOffers[0];
  let maxDiscount = calculateOfferDiscount(targetProductPrice, bestOffer);

  for (let i = 1; i < applicableOffers.length; i++) {
    const currentOffer = applicableOffers[i];
    const currentDiscount = calculateOfferDiscount(targetProductPrice, currentOffer);

    if (currentDiscount > maxDiscount) {
      maxDiscount = currentDiscount;
      bestOffer = currentOffer;
    }
  }

  return bestOffer;
};

export const applyOffersToOrderItems = (
  orderItems: OrderItem[],
  availableOffers: Offer[]
): { updatedItems: OrderItem[]; appliedOffers: Map<string, AppliedOffer> } => {
  const applicableOffers = findApplicableOffers(orderItems, availableOffers);

  if (applicableOffers.length === 0) {
    return { updatedItems: orderItems, appliedOffers: new Map() };
  }

  const offersByTargetProduct = new Map<string, Offer[]>();
  applicableOffers.forEach(offer => {
    const existing = offersByTargetProduct.get(offer.targetProductId) || [];
    existing.push(offer);
    offersByTargetProduct.set(offer.targetProductId, existing);
  });

  const appliedOffersMap = new Map<string, AppliedOffer>();
  const updatedItems = orderItems.map(item => {
    const offersForProduct = offersByTargetProduct.get(item.product.id);

    if (!offersForProduct || offersForProduct.length === 0) {
      return item;
    }

    const bestOffer = selectBestOffer(item.product.sellingPrice, offersForProduct);

    if (!bestOffer) {
      return item;
    }

    const discountAmount = calculateOfferDiscount(item.product.sellingPrice, bestOffer);
    const discountedPrice = Math.max(0, item.product.sellingPrice - discountAmount);

    appliedOffersMap.set(item.product.id, {
      offerId: bestOffer.id,
      offerName: bestOffer.name,
      triggerProductId: bestOffer.triggerProductId,
      targetProductId: bestOffer.targetProductId,
      discountType: bestOffer.discountType,
      discountValue: bestOffer.discountValue,
      discountAmount: discountAmount,
    });

    return {
      ...item,
      product: {
        ...item.product,
        sellingPrice: discountedPrice,
      }
    };
  });

  return { updatedItems, appliedOffers: appliedOffersMap };
};

export const getAppliedOfferForOrder = (
  appliedOffersMap: Map<string, AppliedOffer>
): AppliedOffer | null => {
  const offers = Array.from(appliedOffersMap.values());

  if (offers.length === 0) {
    return null;
  }

  return offers.reduce((best, current) => {
    return current.discountAmount > best.discountAmount ? current : best;
  });
};
