/**
 * IRPF (Income Tax) constants.
 *
 * Sources:
 * - AEAT (Agencia Tributaria): https://sede.agenciatributaria.gob.es
 * - BOE (Boletín Oficial del Estado)
 *
 * Last updated: 2025
 */

// =============================================================================
// IRPF Brackets (Combined state reference)
// =============================================================================

/**
 * IRPF tax brackets for 2024.
 *
 * Progressive tax system where each bracket applies only to the
 * portion of income within that range.
 *
 * Note: These are the general state brackets. Autonomous communities
 * can modify the regional portion (roughly half of each rate).
 */
export const IRPF_BRACKETS = [
  { limit: 12450, rate: 0.19 },
  { limit: 20200, rate: 0.24 },
  { limit: 35200, rate: 0.30 },
  { limit: 60000, rate: 0.37 },
  { limit: 300000, rate: 0.45 },
  { limit: Infinity, rate: 0.47 },
] as const;

// =============================================================================
// Personal and Family Minimums
// =============================================================================

/**
 * IRPF personal minimum (mínimo personal y familiar).
 * Base amount that reduces taxable income.
 */
export const IRPF_PERSONAL_MINIMUM = 5550;

/**
 * IRPF minimum per descendant (mínimo por descendiente).
 * Values vary by child order according to AEAT:
 * - 1st child: €2,400
 * - 2nd child: €2,700
 * - 3rd child: €4,000
 * - 4th and subsequent: €4,500
 */
export const IRPF_CHILD_DEDUCTIONS = [2400, 2700, 4000, 4500];

/**
 * IRPF deduction per dependent child (legacy, uniform rate).
 * @deprecated Use IRPF_CHILD_DEDUCTIONS for accurate graduated calculation
 */
export const IRPF_CHILD_DEDUCTION = 2400;

/**
 * Additional IRPF deduction for children under 3 years old.
 * Source: AEAT - Incremento por descendiente menor de 3 años
 */
export const IRPF_CHILD_UNDER_3_BONUS = 2920;

// =============================================================================
// Gastos Deducibles del Trabajo (Work Income Deductible Expenses)
// =============================================================================

/**
 * General deductible expense for work income (Otros gastos deducibles).
 *
 * Article 19.2.f) LIRPF: All taxpayers with work income can deduct €2,000
 * annually, automatically applied. This is separate from SS contributions.
 *
 * Source: https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2024/c03-rendimientos-trabajo/rendimiento-neto-trabajo-integrar-base-imponible/fase-2-determinacion-rendimiento-neto/gastos-deducibles-articulo-19-ley-irpf.html
 */
export const WORK_INCOME_GENERAL_EXPENSE = 2000;

// =============================================================================
// Reducción por Rendimientos del Trabajo (Work Income Reduction)
// =============================================================================

/**
 * Reduction for work income (Reducción por obtención de rendimientos del trabajo).
 *
 * This reduction applies to net work income and makes low salaries (like SMI)
 * effectively tax-free. Only applies if other income ≤ €6,500.
 *
 * Source: Art. 20 LIRPF, modified by RDL 4/2024
 * https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-ayuda-presentacion/irpf-2024/7-cumplimentacion-irpf/7_1-rendimientos-trabajo-personal/7_1_6-reduccion-obtencion-rendimientos-trabajo.html
 */
export const WORK_INCOME_REDUCTION = {
  /** Maximum net income to apply the reduction */
  MAX_NET_INCOME: 19747.5,
  /** Maximum other income allowed to apply reduction */
  MAX_OTHER_INCOME: 6500,

  /** First threshold: full reduction applies below this */
  THRESHOLD_1: 14852,
  /** Second threshold: gradual reduction between threshold 1 and 2 */
  THRESHOLD_2: 17673.52,

  /** Full reduction amount for incomes ≤ THRESHOLD_1 */
  FULL_REDUCTION: 7302,
  /** Reduction at THRESHOLD_2 */
  REDUCTION_AT_T2: 2364.34,

  /** Factor for calculating reduction between THRESHOLD_1 and THRESHOLD_2 */
  FACTOR_1: 1.75,
  /** Factor for calculating reduction between THRESHOLD_2 and MAX_NET_INCOME */
  FACTOR_2: 1.14,
} as const;
