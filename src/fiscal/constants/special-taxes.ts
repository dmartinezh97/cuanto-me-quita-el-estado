/**
 * Impuestos Especiales (Excise Duties) rates.
 *
 * Sources:
 * - Ley 38/1992, de Impuestos Especiales
 * - BOE (Boletín Oficial del Estado)
 *
 * Last updated: 2025
 */

// =============================================================================
// IEH - Impuesto Especial sobre Hidrocarburos
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

// =============================================================================
// IEE - Impuesto Especial sobre la Electricidad
// =============================================================================

/**
 * IEE - Impuesto Especial sobre la Electricidad (Electricity Tax)
 *
 * Rate applied to electricity consumption: 5.11%
 * Temporarily reduced from 5.1127% in some periods.
 * Applied on base + transport costs.
 */
export const ELECTRICITY_TAX_RATE = 0.0511;

// =============================================================================
// IPS - Impuesto sobre Primas de Seguros
// =============================================================================

/**
 * IPS - Impuesto sobre Primas de Seguros (Insurance Premium Tax)
 *
 * Applied to insurance premiums (car, home, health, etc.)
 * Rate: 6% on the premium amount
 * Note: Insurance is exempt from IVA, but subject to IPS
 */
export const INSURANCE_PREMIUM_TAX_RATE = 0.06;

// =============================================================================
// Alcohol and Tobacco
// =============================================================================

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
