/**
 * Abbas Share Calculation
 *
 * Abbas provides legal support for 5% of each partner's net profit.
 *
 * Net Profit Base = Profit Share − Operating Expenses
 * (Product cost recovery and reimbursements are capital flows, NOT profit)
 *
 * @param profitShare - Partner's profit share from orders
 * @param expenses    - Partner's share of operating expenses
 * @returns Abbas's 5% cut from this partner
 *
 * @example
 * const yassirAbbas = calculateAbbasShare(5000, 500); // (5000 - 500) * 0.05 = 225 SAR
 * const basimAbbas  = calculateAbbasShare(2000, 300); // (2000 - 300) * 0.05 = 85 SAR
 */
export function calculateAbbasShare(profitShare: number, expenses: number): number {
    return (profitShare - expenses) * 0.05;
}
