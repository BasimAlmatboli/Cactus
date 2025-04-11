export const FREE_SHIPPING_THRESHOLD = 200;

export const calculateShippingDisplay = (subtotal: number, shippingCost: number) => {
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  return {
    displayCost: isFreeShipping ? 0 : shippingCost,
    actualCost: shippingCost,
    isFreeShipping
  };
};