import type { PaymentMethod } from '../types';

/**
 * Calculate payment fees dynamically based on payment method configuration
 * @param paymentMethod - Payment method object with fee configuration
 * @param amount - Transaction amount
 * @returns Total fees including tax
 */
export const calculatePaymentFees = (
  paymentMethod: PaymentMethod,
  amount: number
): number => {
  const paymentGatewayFee = amount * (paymentMethod.fee_percentage / 100);
  const baseFees = paymentGatewayFee + paymentMethod.fee_fixed;
  const feesTax = baseFees * (paymentMethod.tax_rate / 100);
  return baseFees + feesTax;
};

// Legacy functions kept for reference (will be removed after migration)
/** @deprecated Use calculatePaymentFees with PaymentMethod object */

export const calculateMadaFees = (amount: number): number => {
  const paymentGatewayFee = amount * 0.01;
  const purchaseExperienceFee = 1;
  const baseFees = paymentGatewayFee + purchaseExperienceFee;
  const feesTax = baseFees * 0.15;
  return baseFees + feesTax;
};

export const calculateVisaFees = (amount: number): number => {
  const paymentGatewayFee = amount * 0.022;
  const purchaseExperienceFee = 1;
  const baseFees = paymentGatewayFee + purchaseExperienceFee;
  const feesTax = baseFees * 0.15;
  return baseFees + feesTax;
};

export const calculateTamaraFees = (amount: number): number => {
  const fixedFee = 1.5;
  const variableFee = amount * 0.07;
  const baseFees = fixedFee + variableFee;
  const feesTax = baseFees * 0.15;
  return baseFees + feesTax;
};

export const getPaymentFeePercentage = (paymentMethodId: string): number => {
  switch (paymentMethodId) {
    case 'mada':
      return 1.0; // 1%
    case 'visa':
      return 2.2; // 2.2%
    case 'tamara':
      return 7.0; // 7%
    default:
      return 0;
  }
};