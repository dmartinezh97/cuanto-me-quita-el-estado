/**
 * Autonomous Communities IRPF Tax Brackets - Index.
 *
 * Re-exports all CCAA-related constants and utilities.
 */

import type { IRPFBracket, AutonomousCommunity } from '@/types';
import { STATE_IRPF_BRACKETS, AUTONOMOUS_COMMUNITIES } from './common';
import { FORAL_COMMUNITIES } from './foral';

// Re-export everything
export { STATE_IRPF_BRACKETS, AUTONOMOUS_COMMUNITIES } from './common';
export { FORAL_COMMUNITIES } from './foral';

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get all communities (common + foral) for display purposes.
 */
export const ALL_COMMUNITIES: AutonomousCommunity[] = [
  ...AUTONOMOUS_COMMUNITIES,
  ...FORAL_COMMUNITIES,
].sort((a, b) => a.name.localeCompare(b.name, 'es'));

/**
 * Find a community by its ID.
 */
export function getCommunityById(id: string): AutonomousCommunity | undefined {
  return ALL_COMMUNITIES.find(c => c.id === id);
}

/**
 * Check if a community uses the foral regime.
 */
export function isForalCommunity(id: string): boolean {
  return FORAL_COMMUNITIES.some(c => c.id === id);
}

/**
 * Calculate progressive tax for a given income using brackets.
 *
 * @param income - Taxable income
 * @param brackets - Tax brackets to apply
 * @returns Total tax amount
 */
export function calculateProgressiveTax(income: number, brackets: IRPFBracket[]): number {
  let tax = 0;
  let remaining = income;
  let previousLimit = 0;

  for (const bracket of brackets) {
    const bracketIncome = Math.min(remaining, bracket.limit - previousLimit);
    if (bracketIncome <= 0) break;

    tax += bracketIncome * bracket.rate;
    remaining -= bracketIncome;
    previousLimit = bracket.limit;
  }

  return tax;
}
