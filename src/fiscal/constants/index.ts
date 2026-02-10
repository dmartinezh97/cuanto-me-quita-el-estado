/**
 * Fiscal constants index.
 *
 * Re-exports all tax-related constants from their respective modules.
 */

// IRPF
export {
  IRPF_BRACKETS,
  IRPF_PERSONAL_MINIMUM,
  IRPF_CHILD_DEDUCTIONS,
  IRPF_CHILD_DEDUCTION,
  IRPF_CHILD_UNDER_3_BONUS,
  WORK_INCOME_GENERAL_EXPENSE,
  WORK_INCOME_REDUCTION,
} from './irpf';

// Social Security
export {
  RATES_SS_EMPLOYER,
  RATES_SS_EMPLOYEE,
  SOCIAL_SECURITY_EMPLOYER_RATE,
  SOCIAL_SECURITY_EMPLOYEE_RATE,
  SS_BASE_MAX_ANNUAL,
  SS_BASE_MAX_MONTHLY,
} from './social-security';

// IVA
export {
  IVA_RATES,
  IVA_FACTOR_4,
  IVA_FACTOR_10,
  IVA_FACTOR_21,
} from './iva';

// Special Taxes
export {
  IEH_PER_LITER,
  GAS_TAX_RATE,
  GAS_IEH_PER_KWH,
  ELECTRICITY_TAX_RATE,
  INSURANCE_PREMIUM_TAX_RATE,
  ALCOHOL_TAX_RATE,
  TOBACCO_TAX_RATE,
} from './special-taxes';

// CCAA
export {
  STATE_IRPF_BRACKETS,
  AUTONOMOUS_COMMUNITIES,
  FORAL_COMMUNITIES,
  ALL_COMMUNITIES,
  getCommunityById,
  isForalCommunity,
  calculateProgressiveTax,
} from './ccaa';
