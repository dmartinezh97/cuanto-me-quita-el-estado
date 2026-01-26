/**
 * Formatting utilities for fiscal calculations.
 */

// =============================================================================
// Currency Formatting
// =============================================================================

/**
 * Format a number as Spanish currency (EUR).
 */
export function formatCurrency(val: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

/**
 * Format a number as percentage.
 */
export function formatPercentage(val: number, decimals: number = 2): string {
  return `${(val * 100).toFixed(decimals)}%`;
}
