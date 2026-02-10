/**
 * Social Security calculations.
 *
 * Re-exports Social Security rates and provides calculation utilities.
 */

import {
  SS_BASE_MAX_ANNUAL,
} from '@fiscal/constants';

// Re-export rates for convenience
export {
  RATES_SS_EMPLOYER,
  RATES_SS_EMPLOYEE,
  SOCIAL_SECURITY_EMPLOYER_RATE,
  SOCIAL_SECURITY_EMPLOYEE_RATE,
  SS_BASE_MAX_ANNUAL,
  SS_BASE_MAX_MONTHLY,
} from '@fiscal/constants';

/**
 * Calculate Social Security contribution with the annual base cap.
 *
 * Contributions are calculated on the lesser of the gross salary
 * and the maximum annual contribution base (58,914€ in 2025).
 *
 * @param annualGross - Annual gross salary
 * @param rate - SS rate to apply (e.g., 0.0648 for employee)
 * @returns Annual SS contribution amount
 */
export function calculateSSContribution(annualGross: number, rate: number): number {
  const cappedBase = Math.min(annualGross, SS_BASE_MAX_ANNUAL);
  return cappedBase * rate;
}
