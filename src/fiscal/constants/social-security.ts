/**
 * Social Security contribution rates.
 *
 * Sources:
 * - Seguridad Social: https://www.seg-social.es
 * - BOE (Boletín Oficial del Estado)
 *
 * Last updated: 2025
 */

// =============================================================================
// Employer Rates
// =============================================================================

/**
 * Employer Social Security contribution rates.
 * These are paid by the company on top of the gross salary.
 */
export const RATES_SS_EMPLOYER = {
  /** Contingencias comunes: cubre jubilación, incapacidad, etc. */
  CONTINGENCIAS_COMUNES: 0.2360,
  /** Desempleo: prestación por desempleo */
  DESEMPLEO: 0.0550,
  /** FOGASA: Fondo de Garantía Salarial */
  FOGASA: 0.0020,
  /** Formación profesional */
  FORMACION: 0.0060,
  /** MEI: Mecanismo de Equidad Intergeneracional (BOE Orden PJC/178/2025) */
  MEI: 0.0067,
  /** AT y EP: Accidentes de Trabajo y Enfermedades Profesionales (media) */
  AT_EP: 0.0150,
} as const;

/** Total employer SS rate (sum of all components) */
export const SOCIAL_SECURITY_EMPLOYER_RATE = 0.3207;

// =============================================================================
// Employee Rates
// =============================================================================

/**
 * Employee Social Security contribution rates.
 * These are deducted from the gross salary.
 */
export const RATES_SS_EMPLOYEE = {
  /** Contingencias comunes */
  CONTINGENCIAS_COMUNES: 0.0470,
  /** Desempleo */
  DESEMPLEO: 0.0155,
  /** Formación profesional */
  FORMACION: 0.0010,
  /** MEI: Mecanismo de Equidad Intergeneracional (BOE Orden PJC/178/2025) */
  MEI: 0.0013,
} as const;

/** Total employee SS rate (sum of all components) */
export const SOCIAL_SECURITY_EMPLOYEE_RATE = 0.0648;

// =============================================================================
// Contribution Base Limits (2025)
// =============================================================================

/**
 * Maximum monthly contribution base for Social Security (2025).
 * Source: BOE Orden PJC/178/2025
 */
export const SS_BASE_MAX_MONTHLY = 4909.50;

/**
 * Maximum annual contribution base for Social Security (2025).
 * 4,909.50€ × 12 = 58,914€
 */
export const SS_BASE_MAX_ANNUAL = 58914;
