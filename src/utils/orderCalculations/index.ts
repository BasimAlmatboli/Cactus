/**
 * Order Calculations - Centralized Business Logic
 * 
 * This module contains ALL order calculation functions.
 * All pages and components MUST use these functions.
 * 
 * Principles:
 * - Single Responsibility: Each function does ONE thing
 * - Pure Functions: Same input → Same output
 * - No Side Effects: No mutations, no external dependencies
 * - Centralized: Change logic in ONE place
 * 
 * Usage:
 * ```typescript
 * import { calculateCompleteOrder } from '@/utils/orderCalculations';
 * 
 * const result = await calculateCompleteOrder({
 *   orderItems,
 *   shippingMethod,
 *   paymentMethod,
 *   discount,
 *   freeShippingThreshold: 100
 * });
 * 
 * console.log(result.customerTotal); // What customer pays
 * console.log(result.paymentFees);   // What you pay to gateway
 * ```
 */

// Individual calculation functions
export { calculateSubtotal } from './subtotal';
export { calculateDiscountAmount } from './discount';
export {
    determineIsFreeShipping,
    calculateActualShippingCost
} from './shipping';
export { calculateCustomerTotal } from './customerTotal';
export { calculatePaymentFees } from './fees';

// Complete order calculation (orchestrator)
export {
    calculateCompleteOrder,
    type OrderCalculationInputs,
    type OrderCalculationResult
} from './completeOrder';
