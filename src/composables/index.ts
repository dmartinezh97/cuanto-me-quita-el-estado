/**
 * Composables index file.
 *
 * Re-exports all composables for convenient importing:
 * import { useTooltip, useExpenses } from '@/composables';
 */

export { useTooltip } from './useTooltip';
export type { TooltipState, UseTooltipOptions, UseTooltipReturn } from './useTooltip';

export { calculateBoundedValue, handleBoundedInput } from './useBoundedInput';

export { useExpenses } from './useExpenses';
export type { IVAKey, UseExpensesReturn } from './useExpenses';

export { useFiscalCalculations } from './useFiscalCalculations';
export type {
  SSBreakdown,
  IVABreakdown,
  UseFiscalCalculationsParams,
  UseFiscalCalculationsReturn,
} from './useFiscalCalculations';
