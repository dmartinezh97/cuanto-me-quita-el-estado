/**
 * Composable for all fiscal calculations.
 *
 * Why this exists:
 * - Groups 20+ computed values that were scattered in App.vue
 * - Provides clear separation between input state and derived calculations
 * - Makes it easy to test fiscal logic in isolation
 *
 * Contract:
 * - Input: reactive refs for salary, expenses, personal data, view mode
 * - Output: computed values for all tax calculations
 *
 * Invariants:
 * - All monetary values are in EUR
 * - Annual values are the source of truth; monthly/per-paycheck are derived
 * - State share + user share = employer cost (for verification)
 */

import { computed, type Ref, type ComputedRef } from 'vue';
import type { AppState, CategoryExpense } from '@/types';
import {
  calculateIRPF,
  calculateIVABreakdown,
  SOCIAL_SECURITY_EMPLOYEE_RATE,
  SOCIAL_SECURITY_EMPLOYER_RATE,
  RATES_SS_EMPLOYEE,
  RATES_SS_EMPLOYER,
} from '@/utils/calculations';

/**
 * Social Security breakdown for display in the ticket.
 */
export interface SSBreakdown {
  contingenciasComunes: number;
  desempleo: number;
  formacion: number;
  mei: number;
  fogasa?: number;  // Only for employer
  atEp?: number;    // Only for employer
}

/**
 * IVA breakdown from calculateIVABreakdown.
 */
export interface IVABreakdown {
  iva4: number;
  iva10: number;
  iva21: number;
  ieh: number;
  ips: number;
  iee: number;
  specialOthers: number;
  totalIndirect: number;
  detailedItems: { name: string; iva: number; special: number; type: string }[];
}

export interface UseFiscalCalculationsParams {
  /** Reactive application state */
  state: AppState;
  /** Reactive expense categories (from useExpenses) */
  expenses: CategoryExpense[];
  /** Total monthly expenses (from useExpenses.totalMonthly) */
  totalExpensesMonthly: ComputedRef<number>;
}

export interface UseFiscalCalculationsReturn {
  // === Gross & Employer Costs ===
  annualGross: ComputedRef<number>;
  employerCostAnnual: ComputedRef<number>;
  employerSSAnnual: ComputedRef<number>;
  employerSSBreakdown: ComputedRef<SSBreakdown>;

  // === Employee Deductions ===
  irpfRate: ComputedRef<number>;
  irpfAnnual: ComputedRef<number>;
  employeeSSAnnual: ComputedRef<number>;
  employeeSSBreakdown: ComputedRef<SSBreakdown>;
  netAnnual: ComputedRef<number>;

  // === Indirect Taxes ===
  indirectTaxes: ComputedRef<IVABreakdown>;
  totalIndirectAnnual: ComputedRef<number>;

  // === Aggregates ===
  stateShareAnnual: ComputedRef<number>;
  userShareAnnual: ComputedRef<number>;
  availableSalary: ComputedRef<number>;

  // === Display Factors ===
  isAnnual: ComputedRef<boolean>;
  displayFactor: ComputedRef<number>;
  displayFactorExpenses: ComputedRef<number>;
}

/**
 * Creates computed fiscal calculations based on input state.
 *
 * All calculations are reactive and update automatically when
 * the underlying state changes.
 *
 * Usage:
 * ```ts
 * const fiscalCalcs = useFiscalCalculations({
 *   state,
 *   expenses,
 *   totalExpensesMonthly,
 * });
 *
 * // In template:
 * // {{ formatCurrency(fiscalCalcs.netAnnual.value * fiscalCalcs.displayFactor.value) }}
 * ```
 */
export function useFiscalCalculations(
  params: UseFiscalCalculationsParams
): UseFiscalCalculationsReturn {
  const { state, expenses, totalExpensesMonthly } = params;

  // ==========================================================================
  // Display Mode
  // ==========================================================================

  /**
   * Whether we're showing annual values (vs monthly/per-paycheck).
   */
  const isAnnual = computed(() => state.viewMode === 'Anual');

  /**
   * Factor to convert annual salary to display value.
   * - Annual mode: 1 (show full year)
   * - Monthly mode: 1/numPayments (show per paycheck)
   */
  const displayFactor = computed(() =>
    isAnnual.value ? 1 : 1 / (state.numPayments || 12)
  );

  /**
   * Factor to convert monthly expenses to display value.
   * - Annual mode: 12 (multiply monthly by 12)
   * - Monthly mode: 1 (show as-is)
   */
  const displayFactorExpenses = computed(() =>
    isAnnual.value ? 12 : 1
  );

  // ==========================================================================
  // Gross & Employer Costs
  // ==========================================================================

  /**
   * Annual gross salary (before any deductions).
   * This is the base for all calculations.
   */
  const annualGross = computed(() => state.grossSalary);

  /**
   * Employer's total cost = gross + employer SS contributions.
   * This is what the company actually pays.
   */
  const employerCostAnnual = computed(() =>
    annualGross.value * (1 + SOCIAL_SECURITY_EMPLOYER_RATE)
  );

  /**
   * Total employer Social Security contributions.
   */
  const employerSSAnnual = computed(() =>
    annualGross.value * SOCIAL_SECURITY_EMPLOYER_RATE
  );

  /**
   * Breakdown of employer SS contributions by component.
   */
  const employerSSBreakdown = computed<SSBreakdown>(() => ({
    contingenciasComunes: annualGross.value * RATES_SS_EMPLOYER.CONTINGENCIAS_COMUNES,
    desempleo: annualGross.value * RATES_SS_EMPLOYER.DESEMPLEO,
    formacion: annualGross.value * RATES_SS_EMPLOYER.FORMACION,
    mei: annualGross.value * RATES_SS_EMPLOYER.MEI,
    fogasa: annualGross.value * RATES_SS_EMPLOYER.FOGASA,
    atEp: annualGross.value * RATES_SS_EMPLOYER.AT_EP,
  }));

  // ==========================================================================
  // Employee Deductions
  // ==========================================================================

  /**
   * Effective IRPF rate based on income and personal circumstances.
   * Returns a decimal (e.g., 0.15 for 15%).
   */
  const irpfRate = computed(() => calculateIRPF(annualGross.value, state));

  /**
   * Annual IRPF amount (income tax).
   */
  const irpfAnnual = computed(() => annualGross.value * irpfRate.value);

  /**
   * Total employee Social Security contributions.
   */
  const employeeSSAnnual = computed(() =>
    annualGross.value * SOCIAL_SECURITY_EMPLOYEE_RATE
  );

  /**
   * Breakdown of employee SS contributions by component.
   */
  const employeeSSBreakdown = computed<SSBreakdown>(() => ({
    contingenciasComunes: annualGross.value * RATES_SS_EMPLOYEE.CONTINGENCIAS_COMUNES,
    desempleo: annualGross.value * RATES_SS_EMPLOYEE.DESEMPLEO,
    formacion: annualGross.value * RATES_SS_EMPLOYEE.FORMACION,
    mei: annualGross.value * RATES_SS_EMPLOYEE.MEI,
  }));

  /**
   * Net annual salary after IRPF and employee SS.
   * This is what ends up in the employee's bank account.
   */
  const netAnnual = computed(() =>
    annualGross.value - irpfAnnual.value - employeeSSAnnual.value
  );

  // ==========================================================================
  // Indirect Taxes (IVA + Excise Duties)
  // ==========================================================================

  /**
   * Full IVA breakdown based on expense categories.
   * Includes IVA by rate, special taxes (IEH, IEE, IPS), and detailed items.
   */
  const indirectTaxes = computed(() =>
    calculateIVABreakdown({ ...state, expenses })
  );

  /**
   * Total indirect taxes paid annually.
   * (Monthly breakdown × 12)
   */
  const totalIndirectAnnual = computed(() =>
    indirectTaxes.value.totalIndirect * 12
  );

  // ==========================================================================
  // Aggregates
  // ==========================================================================

  /**
   * Total amount going to the state annually.
   * Includes: employer SS + IRPF + employee SS + indirect taxes.
   */
  const stateShareAnnual = computed(() =>
    employerSSAnnual.value +
    irpfAnnual.value +
    employeeSSAnnual.value +
    totalIndirectAnnual.value
  );

  /**
   * Amount the user actually keeps after all taxes.
   * Net salary minus indirect taxes on consumption.
   */
  const userShareAnnual = computed(() =>
    netAnnual.value - totalIndirectAnnual.value
  );

  /**
   * Available salary after expenses (adjusted for display mode).
   * Used to show remaining budget and validate bounded inputs.
   */
  const availableSalary = computed(() => {
    const netDisplay = netAnnual.value * displayFactor.value;
    const expensesDisplay = totalExpensesMonthly.value * displayFactorExpenses.value;
    return netDisplay - expensesDisplay;
  });

  return {
    // Gross & Employer
    annualGross,
    employerCostAnnual,
    employerSSAnnual,
    employerSSBreakdown,

    // Employee Deductions
    irpfRate,
    irpfAnnual,
    employeeSSAnnual,
    employeeSSBreakdown,
    netAnnual,

    // Indirect Taxes
    indirectTaxes,
    totalIndirectAnnual,

    // Aggregates
    stateShareAnnual,
    userShareAnnual,
    availableSalary,

    // Display
    isAnnual,
    displayFactor,
    displayFactorExpenses,
  };
}
