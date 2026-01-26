/**
 * IVA (Value Added Tax) rates and constants.
 *
 * Sources:
 * - AEAT (Agencia Tributaria): https://sede.agenciatributaria.gob.es
 *
 * Last updated: 2025
 */

// =============================================================================
// IVA Rates
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

// =============================================================================
// IVA Factors
// =============================================================================

/**
 * IVA factors for calculating base from PVP (Price Including Tax).
 * Formula: base = PVP / factor
 * Factor = 1 + rate
 */
export const IVA_FACTOR_4 = 1.04;
export const IVA_FACTOR_10 = 1.10;
export const IVA_FACTOR_21 = 1.21;
