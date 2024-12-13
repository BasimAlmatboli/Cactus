export const calculateMadaFees = (amount: number) => {
  const paymentGatewayFee = amount * 0.01;
  const purchaseExperienceFee = 1;
  const baseFees = paymentGatewayFee + purchaseExperienceFee;
  const feesTax = baseFees * 0.15;
  return baseFees + feesTax;
};

export const calculateVisaFees = (amount: number) => {
  const paymentGatewayFee = amount * 0.022;
  const purchaseExperienceFee = 1;
  const baseFees = paymentGatewayFee + purchaseExperienceFee;
  const feesTax = baseFees * 0.15;
  return baseFees + feesTax;
};

export const calculateTamaraFees = (amount: number) => {
  const fixedFee = 1.5;
  const variableFee = amount * 0.07;
  const baseFees = fixedFee + variableFee;
  const feesTax = baseFees * 0.15;
  return baseFees + feesTax;
};