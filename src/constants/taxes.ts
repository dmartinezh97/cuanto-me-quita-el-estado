/**
 * Spanish tax rates and constants.
 *
 * This file centralizes all tax-related magic numbers that were previously
 * hardcoded in calculations.ts. Having them in one place makes it easier to:
 * - Update rates when legislation changes
 * - Document the source/rationale for each value
 * - Test with different scenarios
 *
 * Sources:
 * - AEAT (Agencia Tributaria): https://sede.agenciatributaria.gob.es
 * - BOE (Boletín Oficial del Estado) for excise duties
 */

// =============================================================================
// IVA (Value Added Tax) Rates
// =============================================================================

/**
 * Spanish IVA rates as decimals.
 * These are the percentages applied to the base price.
 */
export const IVA_RATES = {
  /** Super-reduced rate: basic food, books, medicines with prescription */
  SUPER_REDUCED: 0.04,
  /** Reduced rate: meat, fish, restaurants, hotels, transport */
  REDUCED: 0.10,
  /** General rate: most goods and services */
  GENERAL: 0.21,
} as const;

/**
 * IVA factors for calculating base from PVP (Price Including Tax).
 * Formula: base = PVP / factor
 * Factor = 1 + rate
 */
export const IVA_FACTOR_4 = 1.04;
export const IVA_FACTOR_10 = 1.10;
export const IVA_FACTOR_21 = 1.21;

// =============================================================================
// Impuestos Especiales (Excise Duties)
// =============================================================================

/**
 * IEH - Impuesto Especial sobre Hidrocarburos (Hydrocarbons Tax)
 *
 * Fixed amount per liter of fuel. Includes:
 * - Type A: General rate (estado)
 * - Type B: Autonomous community supplement
 *
 * Current combined rate for gasoline/diesel: 0.4007 EUR/liter (2024)
 * Source: Ley 38/1992, de Impuestos Especiales
 */
export const IEH_PER_LITER = 0.4007;

/**
 * Gas natural rate.
 * Approximate percentage of PVP that goes to IEH for natural gas.
 */
export const GAS_TAX_RATE = 0.025;

/**
 * IEH per kWh for natural gas.
 * Impuesto Especial de Hidrocarburos - specific amount per kilowatt-hour.
 * Used for display purposes in gas natural item label.
 */
export const GAS_IEH_PER_KWH = 0.00234;

/**
 * IEE - Impuesto Especial sobre la Electricidad (Electricity Tax)
 *
 * Rate applied to electricity consumption: 5.11%
 * Temporarily reduced from 5.1127% in some periods.
 * Applied on base + transport costs.
 */
export const ELECTRICITY_TAX_RATE = 0.0511;

/**
 * IPS - Impuesto sobre Primas de Seguros (Insurance Premium Tax)
 *
 * Applied to insurance premiums (car, home, health, etc.)
 * Rate: 6% on the premium amount
 * Note: Insurance is exempt from IVA, but subject to IPS
 */
export const INSURANCE_PREMIUM_TAX_RATE = 0.06;

/**
 * Impuesto Especial sobre el Alcohol
 *
 * Approximate effective rate on retail alcohol sales.
 * Actual tax is complex (per hectoliter of pure alcohol), but
 * ~5% of PVP is a reasonable approximation for mixed beverages.
 */
export const ALCOHOL_TAX_RATE = 0.05;

/**
 * Impuesto sobre las Labores del Tabaco (Tobacco Tax)
 *
 * Approximate percentage of PVP (before IVA) that goes to tobacco tax.
 * Actual calculation is complex (ad valorem + specific component),
 * but ~57% of PVP-sin-IVA is a good approximation for cigarettes.
 *
 * Formula: tobacco_tax = (PVP / 1.21) * 0.57
 */
export const TOBACCO_TAX_RATE = 0.57;

// =============================================================================
// IRPF (Income Tax) Brackets
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
