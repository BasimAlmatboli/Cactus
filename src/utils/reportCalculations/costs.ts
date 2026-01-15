import { Order } from '../../types';

/**
 * Calculate Total Product Costs (COGS)
 * 
 * Sum of all product costs across all orders
 * 
 * @param orders - Array of orders
 * @returns Total product costs
 * 
 * @example
 * const costs = calculateTotalProductCosts(orders); // 8500 SAR
 */
export function calculateTotalProductCosts(orders: Order[]): number {
    return orders.reduce((sum, order) => {
        return sum + order.items.reduce((itemSum, item) => {
            return itemSum + (item.product.cost * item.quantity);
        }, 0);
    }, 0);
}

/**
 * Calculate Total Shipping Fees
 * 
 * Sum of actual shipping costs paid by the business (not what customer paid)
 * Uses order.shippingMethod.cost (operational cost)
 * 
 * @param orders - Array of orders
 * @returns Total shipping fees paid to carriers
 * 
 * @example
 * const fees = calculateTotalShippingFees(orders); // 1200 SAR
 */
export function calculateTotalShippingFees(orders: Order[]): number {
    return orders.reduce((sum, order) => {
        return sum + order.shippingMethod.cost;
    }, 0);
}

/**
 * Calculate Total Payment Fees
 * 
 * Sum of payment gateway fees across all orders
 * 
 * @param orders - Array of orders
 * @returns Total payment gateway fees
 * 
 * @example
 * const fees = calculateTotalPaymentFees(orders); // 325 SAR
 */
export function calculateTotalPaymentFees(orders: Order[]): number {
    return orders.reduce((sum, order) => sum + order.paymentFees, 0);
}

/**
 * Calculate Total Fees (Shipping + Payment)
 * 
 * @param shippingFees - Total shipping fees
 * @param paymentFees - Total payment fees
 * @returns Combined total fees
 * 
 * @example
 * const totalFees = calculateTotalFees(1200, 325); // 1525 SAR
 */
export function calculateTotalFees(
    shippingFees: number,
    paymentFees: number
): number {
    return shippingFees + paymentFees;
}

/**
 * Calculate Detailed Shipping Fee Data with Company Breakdown
 * 
 * @param orders - Array of orders
 * @returns Detailed shipping fee data including breakdown by company
 */
export function calculateShippingFeeData(orders: Order[]): {
    totalShippingFees: number;
    freeShippingCount: number;
    paidShippingCount: number;
    averageShippingFee: number;
    totalRevenue: number;
    feesAsPercentOfRevenue: number;
    byCompany: Array<{
        companyName: string;
        orderCount: number;
        totalFees: number;
        averageFee: number;
    }>;
} {
    if (!orders.length) {
        return {
            totalShippingFees: 0,
            freeShippingCount: 0,
            paidShippingCount: 0,
            averageShippingFee: 0,
            totalRevenue: 0,
            feesAsPercentOfRevenue: 0,
            byCompany: []
        };
    }

    let totalShippingFees = 0;
    let freeShippingCount = 0;
    let paidShippingCount = 0;
    let totalRevenue = 0;

    const companyMap = new Map<string, { orderCount: number; totalFees: number }>();

    orders.forEach(order => {
        if (order.isFreeShipping) {
            freeShippingCount++;
        } else {
            paidShippingCount++;
        }

        const actualShippingFee = order.shippingMethod.cost;
        totalShippingFees += actualShippingFee;

        const companyName = order.shippingMethod.name;
        const existing = companyMap.get(companyName) || { orderCount: 0, totalFees: 0 };
        companyMap.set(companyName, {
            orderCount: existing.orderCount + 1,
            totalFees: existing.totalFees + actualShippingFee
        });

        totalRevenue += order.total;
    });

    const byCompany = Array.from(companyMap.entries())
        .map(([companyName, data]) => ({
            companyName,
            orderCount: data.orderCount,
            totalFees: data.totalFees,
            averageFee: data.totalFees / data.orderCount
        }))
        .sort((a, b) => b.orderCount - a.orderCount);

    return {
        totalShippingFees,
        freeShippingCount,
        paidShippingCount,
        averageShippingFee: orders.length > 0 ? totalShippingFees / orders.length : 0,
        totalRevenue,
        feesAsPercentOfRevenue: totalRevenue > 0 ? (totalShippingFees / totalRevenue) * 100 : 0,
        byCompany
    };
}

/**
 * Calculate Detailed Payment Fee Data with Method Breakdown
 * 
 * @param orders - Array of orders
 * @returns Detailed payment fee data including breakdown by method
 */
export function calculatePaymentFeeData(orders: Order[]): {
    totalPaymentFees: number;
    averagePaymentFee: number;
    totalRevenue: number;
    feesAsPercentOfRevenue: number;
    averageFeePercentage: number;
    byMethod: Array<{
        methodName: string;
        orderCount: number;
        totalFees: number;
        averageFee: number;
    }>;
} {
    if (!orders.length) {
        return {
            totalPaymentFees: 0,
            averagePaymentFee: 0,
            totalRevenue: 0,
            feesAsPercentOfRevenue: 0,
            averageFeePercentage: 0,
            byMethod: []
        };
    }

    let totalPaymentFees = 0;
    let totalRevenue = 0;

    const paymentMethodMap = new Map<string, { orderCount: number; totalFees: number }>();

    orders.forEach(order => {
        totalPaymentFees += order.paymentFees;
        totalRevenue += order.total;

        const methodName = order.paymentMethod.name;
        const existing = paymentMethodMap.get(methodName) || { orderCount: 0, totalFees: 0 };
        paymentMethodMap.set(methodName, {
            orderCount: existing.orderCount + 1,
            totalFees: existing.totalFees + order.paymentFees
        });
    });

    const byMethod = Array.from(paymentMethodMap.entries())
        .map(([methodName, data]) => ({
            methodName,
            orderCount: data.orderCount,
            totalFees: data.totalFees,
            averageFee: data.totalFees / data.orderCount
        }))
        .sort((a, b) => b.orderCount - a.orderCount);

    return {
        totalPaymentFees,
        averagePaymentFee: totalPaymentFees / orders.length,
        totalRevenue,
        feesAsPercentOfRevenue: totalRevenue > 0 ? (totalPaymentFees / totalRevenue) * 100 : 0,
        averageFeePercentage: totalRevenue > 0 ? (totalPaymentFees / totalRevenue) * 100 : 0,
        byMethod
    };
}
