/**
 * IRPF (Income Tax) calculations.
 *
 * Contains all functions for calculating Spanish income tax.
 */

import type { AppState } from '@/types';
import {
  IRPF_PERSONAL_MINIMUM,
  IRPF_CHILD_DEDUCTIONS,
  IRPF_CHILD_DEDUCTION,
  IRPF_CHILD_UNDER_3_BONUS,
  WORK_INCOME_GENERAL_EXPENSE,
  WORK_INCOME_REDUCTION,
  STATE_IRPF_BRACKETS,
  getCommunityById,
  isForalCommunity,
  calculateProgressiveTax,
} from '@fiscal/constants';
import { SOCIAL_SECURITY_EMPLOYEE_RATE } from './social-security';

// =============================================================================
// Work Income Reduction
// =============================================================================

/**
 * Calculate the work income reduction (reducción por rendimientos del trabajo).
 *
 * This reduction applies to net work income (after SS deductions) and makes
 * low salaries effectively tax-free. Only applies if other income ≤ €6,500.
 *
 * @param netWorkIncome - Net work income (gross - SS employee contributions)
 * @param hasOtherIncome - Whether the person has other income > €6,500
 * @returns The reduction amount to subtract from net income
 */
export function calculateWorkIncomeReduction(
  netWorkIncome: number,
  hasOtherIncome: boolean = false
): number {
  const {
    MAX_NET_INCOME,
    THRESHOLD_1,
    THRESHOLD_2,
    FULL_REDUCTION,
    REDUCTION_AT_T2,
    FACTOR_1,
    FACTOR_2,
  } = WORK_INCOME_REDUCTION;

  // No reduction if other income exceeds limit or net income too high
  if (hasOtherIncome || netWorkIncome > MAX_NET_INCOME) {
    return 0;
  }

  // Full reduction for low incomes
  if (netWorkIncome <= THRESHOLD_1) {
    return FULL_REDUCTION;
  }

  // Gradual reduction between THRESHOLD_1 and THRESHOLD_2
  if (netWorkIncome <= THRESHOLD_2) {
    return FULL_REDUCTION - FACTOR_1 * (netWorkIncome - THRESHOLD_1);
  }

  // Gradual reduction between THRESHOLD_2 and MAX_NET_INCOME
  return Math.max(0, REDUCTION_AT_T2 - FACTOR_2 * (netWorkIncome - THRESHOLD_2));
}

// =============================================================================
// IRPF Calculation
// =============================================================================

/**
 * Calculate IRPF rate for a given gross salary and autonomous community.
 *
 * Spain's IRPF works differently depending on the region:
 * - Régimen común (most regions): 50% state + 50% autonomous brackets
 * - Régimen foral (Navarra, País Vasco): Single unified scale
 *
 * The calculation follows the official AEAT process:
 * 1. Net work income = Gross - SS employee contributions
 * 2. Apply work income reduction (for low salaries)
 * 3. Apply personal and family minimums
 * 4. Calculate progressive tax on taxable base
 *
 * @param gross - Annual gross salary
 * @param state - Application state with family situation
 * @param communityId - ID of the autonomous community
 * @returns Effective IRPF rate as decimal (e.g., 0.25 for 25%)
 */
export function calculateIRPF(
  gross: number,
  state: AppState,
  communityId: string = 'madrid'
): number {
  if (gross <= 0) return 0;

  // Step 1: Calculate net work income (rendimiento neto del trabajo)
  // Deductible expenses: SS employee contributions + €2,000 general expense (art. 19.2.f LIRPF)
  const ssContributions = gross * SOCIAL_SECURITY_EMPLOYEE_RATE;
  const deductibleExpenses = ssContributions + WORK_INCOME_GENERAL_EXPENSE;
  const netWorkIncome = Math.max(0, gross - deductibleExpenses);

  // Step 2: Apply work income reduction (reducción por rendimientos del trabajo)
  // This is what makes low salaries (like SMI) effectively tax-free
  const workReduction = calculateWorkIncomeReduction(netWorkIncome);
  const reducedNetIncome = Math.max(0, netWorkIncome - workReduction);

  // Step 3: Calculate personal and family minimum (mínimo personal y familiar)
  let baseMinimum = IRPF_PERSONAL_MINIMUM;

  // Mínimo por descendientes - escalonado según orden del hijo
  if (state.numChildren > 0) {
    for (let i = 0; i < state.numChildren; i++) {
      const deductionIndex = Math.min(i, IRPF_CHILD_DEDUCTIONS.length - 1);
      baseMinimum += IRPF_CHILD_DEDUCTIONS[deductionIndex];
    }
  }

  // Incremento por descendiente menor de 3 años
  if (state.numChildrenUnder3 > 0) {
    baseMinimum += state.numChildrenUnder3 * IRPF_CHILD_UNDER_3_BONUS;
  }

  // Step 4: Calculate taxable income (base liquidable)
  const taxableIncome = Math.max(0, reducedNetIncome - baseMinimum);

  // Get community brackets
  const community = getCommunityById(communityId);
  if (!community) {
    // Fallback to state brackets only if community not found
    const tax = calculateProgressiveTax(taxableIncome, STATE_IRPF_BRACKETS);
    return tax / gross;
  }

  let totalTax: number;

  if (isForalCommunity(communityId)) {
    // Foral regime: Use only the community's unified scale
    totalTax = calculateProgressiveTax(taxableIncome, community.brackets);
  } else {
    // Common regime: State portion + Autonomous portion
    const stateTax = calculateProgressiveTax(taxableIncome, STATE_IRPF_BRACKETS);
    const autonomicTax = calculateProgressiveTax(taxableIncome, community.brackets);
    totalTax = stateTax + autonomicTax;
  }

  return totalTax / gross;
}

/**
 * Legacy IRPF calculation (for backward compatibility).
 * Uses hardcoded brackets without autonomous community support.
 *
 * @deprecated Use calculateIRPF with communityId instead
 */
export function calculateIRPFLegacy(gross: number, state: AppState): number {
  let baseMinimum = IRPF_PERSONAL_MINIMUM;
  if (state.numChildren > 0) baseMinimum += state.numChildren * IRPF_CHILD_DEDUCTION;
  if (state.numChildrenUnder3 > 0) baseMinimum += state.numChildrenUnder3 * IRPF_CHILD_UNDER_3_BONUS;

  const taxableIncome = Math.max(0, gross - baseMinimum);

  // Combined state + autonomous (approximation using old hardcoded rates)
  let tax = 0;
  if (taxableIncome > 300000) {
    tax += (taxableIncome - 300000) * 0.47 + (300000 - 60000) * 0.45 + (60000 - 35200) * 0.37 + (35200 - 20200) * 0.30 + (20200 - 12450) * 0.24 + 12450 * 0.19;
  } else if (taxableIncome > 60000) {
    tax += (taxableIncome - 60000) * 0.45 + (60000 - 35200) * 0.37 + (35200 - 20200) * 0.30 + (20200 - 12450) * 0.24 + 12450 * 0.19;
  } else if (taxableIncome > 35200) {
    tax += (taxableIncome - 35200) * 0.37 + (35200 - 20200) * 0.30 + (20200 - 12450) * 0.24 + 12450 * 0.19;
  } else if (taxableIncome > 20200) {
    tax += (taxableIncome - 20200) * 0.30 + (20200 - 12450) * 0.24 + 12450 * 0.19;
  } else if (taxableIncome > 12450) {
    tax += (taxableIncome - 12450) * 0.24 + 12450 * 0.19;
  } else {
    tax += taxableIncome * 0.19;
  }

  return gross > 0 ? tax / gross : 0;
}
