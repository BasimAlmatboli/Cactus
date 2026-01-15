/**
 * Report Calculations Module
 * 
 * Centralized calculation engine for all report metrics.
 * 
 * **Single Source of Truth** for report calculations.
 * 
 * @example
 * import { calculateAllReportMetrics } from '@/utils/reportCalculations';
 * 
 * const metrics = await calculateAllReportMetrics({ orders, expenses });
 * 
 * // Use in components
 * <BusinessMetricsReport metrics={metrics} />
 */

// Export types
export * from './types';

// Export individual calculation functions
export * from './volume';
export * from './revenue';
export * from './costs';
export * from './profit';
export * from './expenses';
export * from './profitSharing';
export * from './earnings';

// Export main orchestrator
export * from './complete';
