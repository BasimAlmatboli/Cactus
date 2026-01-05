import type { PaymentMethod } from '../../types';

/**
 * Calculate Payment Gateway Fees
 * 
 * Formula: (amount × fee% / 100 + fixedFee) × (1 + tax% / 100)
 * 
 * Step-by-step breakdown:
 * 1. Calculate gateway fee: amount × (fee_percentage / 100)
 * 2. Add fixed fee: gatewayFee + fee_fixed
 * 3. Calculate tax on fees: baseFees × (tax_rate / 100)
 * 4. Total fees: baseFees + tax
 * 
 * Example 1 (MADA - 1% + 1 SAR, 15% tax):
 * Customer Total: 127 SAR
 * Gateway Fee: 127 × (1 / 100) = 1.27 SAR
 * Base Fees: 1.27 + 1.00 = 2.27 SAR
 * Tax (15%): 2.27 × (15 / 100) = 0.34 SAR
 * Total Payment Fees: 2.27 + 0.34 = 2.61 SAR
 * 
 * Example 2 (Visa - 2.2% + 1 SAR, 15% tax):
 * Customer Total: 127 SAR
 * Gateway Fee: 127 × (2.2 / 100) = 2.79 SAR
 * Base Fees: 2.79 + 1.00 = 3.79 SAR
 * Tax (15%): 3.79 × (15 / 100) = 0.57 SAR
 * Total Payment Fees: 3.79 + 0.57 = 4.36 SAR
 * 
 * Example 3 (Tamara - 7% + 1.5 SAR, 15% tax):
 * Customer Total: 127 SAR
 * Gateway Fee: 127 × (7 / 100) = 8.89 SAR
 * Base Fees: 8.89 + 1.50 = 10.39 SAR
 * Tax (15%): 10.39 × (15 / 100) = 1.56 SAR
 * Total Payment Fees: 10.39 + 1.56 = 11.95 SAR
 * 
 * Note: These fees are deducted from YOUR revenue, NOT charged to customer.
 * The customer total is used as the base amount for fee calculation.
 * 
 * @param paymentMethod - Payment method with fee configuration
 * @param amount - Amount to calculate fees on (customer total)
 * @returns Total fees (gateway fee + fixed fee + tax)
 */
export function calculatePaymentFees(
    paymentMethod: PaymentMethod,
    amount: number
): number {
    const gatewayFee = amount * (paymentMethod.fee_percentage / 100);
    const baseFees = gatewayFee + paymentMethod.fee_fixed;
    const tax = baseFees * (paymentMethod.tax_rate / 100);
    return baseFees + tax;
}
