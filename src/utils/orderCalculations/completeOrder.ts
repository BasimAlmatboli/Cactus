import type { OrderItem, ShippingMethod, PaymentMethod, Discount } from '../../types';
import { calculateSubtotal } from './subtotal';
import { calculateDiscountAmount } from './discount';
import { determineIsFreeShipping, calculateActualShippingCost } from './shipping';
import { calculateCustomerTotal } from './customerTotal';
import { calculatePaymentFees } from './fees';
import { calculateTotalProfitShare } from '../profitSharing';

/**
 * Input Parameters for Complete Order Calculation
 */
export interface OrderCalculationInputs {
    orderItems: OrderItem[];
    shippingMethod: ShippingMethod;
    paymentMethod: PaymentMethod;
    discount: Discount | null;
    freeShippingThreshold: number;
    manualIsFreeShipping?: boolean; // Optional: Manual override for free shipping
    /**
     * Optional: amount actually charged to the customer for shipping (REVENUE side).
     * Use this when the customer-facing shipping price differs from the carrier cost
     * (e.g. Salla charged 14 SAR but RedBox costs 15 SAR, or a shipping promotion).
     * When omitted, it defaults to the carrier cost (0 if free shipping), which
     * preserves the original manual-order behavior.
     */
    shippingCharged?: number;
}

/**
 * Complete Order Calculation Result
 */
export interface OrderCalculationResult {
    subtotal: number;
    discountAmount: number;
    isFreeShipping: boolean;
    shippingCharged: number;      // Revenue side: what the customer pays for shipping
    carrierShippingCost: number;  // Expense side: what the business pays the carrier
    actualShippingCost: number;   // Deprecated alias of shippingCharged (kept for compatibility)
    customerFee: number;
    customerTotal: number;
    paymentFees: number;
    netProfit: number;
}

/**
 * Calculate Complete Order (Orchestrator Function)
 * 
 * This is the SINGLE SOURCE OF TRUTH for order calculations.
 * All pages (Calculator, Import, etc.) must call this function.
 * 
 * Calculation Flow:
 * 1. Calculate subtotal from items
 * 2. Calculate discount amount
 * 3. Determine if free shipping applies
 * 4. Calculate actual shipping cost
 * 5. Get customer fee (e.g., COD)
 * 6. Calculate customer total (what customer pays)
 * 7. Calculate payment gateway fees (what you pay)
 * 8. Calculate profit sharing
 * 
 * Complete Example:
 * ────────────────────────────────────────
 * Items:
 *   - Product A: 50 SAR × 2 = 100 SAR
 *   - Product B: 30 SAR × 1 = 30 SAR
 * ────────────────────────────────────────
 * 1. Subtotal:              130 SAR
 * 2. Discount (10%):        -13 SAR
 * 3. Check Free Shipping:   117 >= 100 ✓ (FREE!)
 * 4. Shipping Cost:           0 SAR (free)
 * 5. Customer Fee (COD):    +10 SAR
 * 6. Customer Total:        127 SAR ← Customer pays this
 * 7. Payment Fees (MADA):   2.61 SAR ← You pay this
 * 8. Net Profit:           [calculated by profit sharing]
 * ────────────────────────────────────────
 * 
 * @param inputs - All required order information
 * @returns Complete calculation result
 */
export async function calculateCompleteOrder(
    inputs: OrderCalculationInputs
): Promise<OrderCalculationResult> {
    // 1. Calculate subtotal
    const subtotal = calculateSubtotal(inputs.orderItems);

    // 2. Calculate discount
    const discountAmount = calculateDiscountAmount(subtotal, inputs.discount);

    // 3. Determine free shipping (with manual override support)
    const isFreeShipping = inputs.manualIsFreeShipping !== undefined
        ? inputs.manualIsFreeShipping // Use manual override if provided
        : determineIsFreeShipping(    // Otherwise use automatic threshold check
            subtotal,
            discountAmount,
            inputs.freeShippingThreshold
        );

    // 4. Determine the two shipping numbers (they are DIFFERENT concepts):
    //    - carrierShippingCost = what WE pay the carrier (expense, always the method cost)
    //    - shippingCharged     = what the CUSTOMER pays us for shipping (revenue)
    const carrierShippingCost = inputs.shippingMethod.cost;
    const shippingCharged = inputs.shippingCharged !== undefined
        ? inputs.shippingCharged                                    // explicit (e.g. Salla / promo price)
        : calculateActualShippingCost(carrierShippingCost, isFreeShipping); // default: carrier cost, 0 if free

    // 5. Get customer fee (e.g., COD fee) - default to 0 if not set
    const customerFee = inputs.paymentMethod.customer_fee || 0;

    // 6. Calculate customer total (uses what the customer is CHARGED, not carrier cost)
    const customerTotal = calculateCustomerTotal({
        subtotal,
        shippingCharged,
        discountAmount,
        customerFee,
    });

    // 7. Calculate payment fees
    const paymentFees = calculatePaymentFees(inputs.paymentMethod, customerTotal);

    // 8. Calculate profit sharing
    //    Revenue side uses shippingCharged; expense side uses carrierShippingCost.
    const profitShare = await calculateTotalProfitShare(
        inputs.orderItems,
        carrierShippingCost, // carrier cost = shipping EXPENSE
        paymentFees,
        discountAmount,
        isFreeShipping,
        customerFee,
        shippingCharged      // shipping REVENUE (what the customer paid)
    );

    const netProfit = profitShare.totalYassirShare + profitShare.totalBasimShare;

    return {
        subtotal,
        discountAmount,
        isFreeShipping,
        shippingCharged,
        carrierShippingCost,
        actualShippingCost: shippingCharged, // backward-compat alias
        customerFee,
        customerTotal,
        paymentFees,
        netProfit,
    };
}
