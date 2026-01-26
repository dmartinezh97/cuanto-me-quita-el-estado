/**
 * Fiscal calculations index.
 *
 * Re-exports all calculation functions from their respective modules.
 */

// IRPF
export {
  calculateIRPF,
  calculateIRPFLegacy,
  calculateWorkIncomeReduction,
} from './irpf';

// Social Security
export {
  RATES_SS_EMPLOYER,
  RATES_SS_EMPLOYEE,
  SOCIAL_SECURITY_EMPLOYER_RATE,
  SOCIAL_SECURITY_EMPLOYEE_RATE,
} from './social-security';

// Indirect Taxes
export {
  calculateIVABreakdown,
} from './indirect-taxes';

// Formatters
export {
  formatCurrency,
  formatPercentage,
} from './formatters';
