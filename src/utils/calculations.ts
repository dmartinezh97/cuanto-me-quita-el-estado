/**
 * Fiscal calculations for the Spanish tax calculator.
 *
 * This module contains all pure functions for calculating taxes:
 * - IRPF (income tax) with autonomous community support
 * - IVA (VAT) breakdown by rate
 * - Special taxes (IEH, IPS, IEE, alcohol, tobacco)
 * - Social Security contributions
 */

import type { AppState, IRPFBracket } from '@/types';
import {
  IEH_PER_LITER,
  IVA_FACTOR_21,
  IVA_FACTOR_10,
  IVA_FACTOR_4,
  GAS_TAX_RATE,
  ALCOHOL_TAX_RATE,
  TOBACCO_TAX_RATE,
  IRPF_PERSONAL_MINIMUM,
  IRPF_CHILD_DEDUCTION,
  IRPF_CHILD_UNDER_3_BONUS,
} from '@/constants/taxes';
import {
  STATE_IRPF_BRACKETS,
  isForalCommunity,
  getCommunityById,
  calculateProgressiveTax,
} from '@/constants/autonomousCommunities';

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
 * @param gross - Annual gross salary
 * @param state - Application state with family situation
 * @param communityId - ID of the autonomous community
 * @returns Effective IRPF rate as decimal (e.g., 0.25 for 25%)
 */
export const calculateIRPF = (
  gross: number,
  state: AppState,
  communityId: string = 'madrid'
): number => {
  if (gross <= 0) return 0;

  // Calculate personal minimum (reduces taxable base)
  let baseMinimum = IRPF_PERSONAL_MINIMUM;
  if (state.numChildren > 0) {
    baseMinimum += state.numChildren * IRPF_CHILD_DEDUCTION;
  }
  if (state.numChildrenUnder3 > 0) {
    baseMinimum += state.numChildrenUnder3 * IRPF_CHILD_UNDER_3_BONUS;
  }

  const taxableIncome = Math.max(0, gross - baseMinimum);

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
};

/**
 * Legacy IRPF calculation (for backward compatibility).
 * Uses hardcoded brackets without autonomous community support.
 *
 * @deprecated Use calculateIRPF with communityId instead
 */
export const calculateIRPFLegacy = (gross: number, state: AppState): number => {
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
};

// =============================================================================
// Social Security Rates
// =============================================================================

/**
 * Employer Social Security contribution rates.
 * These are paid by the company on top of the gross salary.
 */
export const RATES_SS_EMPLOYER = {
  CONTINGENCIAS_COMUNES: 0.2360,
  DESEMPLEO: 0.0550,
  FOGASA: 0.0020,
  FORMACION: 0.0060,
  MEI: 0.0058,
  AT_EP: 0.0150,
};

/**
 * Employee Social Security contribution rates.
 * These are deducted from the gross salary.
 */
export const RATES_SS_EMPLOYEE = {
  CONTINGENCIAS_COMUNES: 0.0470,
  DESEMPLEO: 0.0155,
  FORMACION: 0.0010,
  MEI: 0.0012,
};

/** Total employee SS rate (sum of all components) */
export const SOCIAL_SECURITY_EMPLOYEE_RATE = 0.0647;

/** Total employer SS rate (sum of all components) */
export const SOCIAL_SECURITY_EMPLOYER_RATE = 0.3198;

// =============================================================================
// Formatting
// =============================================================================

/**
 * Format a number as Spanish currency (EUR).
 */
export const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

// =============================================================================
// IVA and Special Taxes Calculation
// =============================================================================

/**
 * Calculate IVA and special taxes breakdown from expenses.
 *
 * Uses display.taxDisplayType for determining calculation logic instead of
 * hardcoded sub.id checks. This makes the code data-driven and extensible.
 */
export const calculateIVABreakdown = (state: AppState) => {
  let totalIVA4 = 0;
  let totalIVA10 = 0;
  let totalIVA21 = 0;
  let totalIEH = 0; // Hydrocarbons tax
  let totalIPS = 0; // Insurance tax
  let totalIEE = 0; // Electricity tax
  let totalSpecialOthers = 0; // Alcohol and Tobacco specific taxes

  const detailedItems: { name: string; iva: number; special: number; type: string }[] = [];

  state.expenses.forEach(cat => {
    if (cat.subItems && cat.subItems.length > 0) {
      cat.subItems.forEach(sub => {
        const totalPVP = sub.amount;
        if (totalPVP <= 0) return;

        let iva = 0;
        let special = 0;
        let specialType = '';

        // Use display.taxDisplayType for calculation logic
        const taxType = sub.display?.taxDisplayType ?? 'standard';

        switch (taxType) {
          case 'fuel': {
            // Fuel: IEH is a fixed amount per liter
            const pricePerLiter = sub.pricePerUnit ?? 1.60;
            const liters = totalPVP / pricePerLiter;
            const iehAmount = liters * IEH_PER_LITER;
            const basePlusIEH = totalPVP / IVA_FACTOR_21;
            iva = totalPVP - basePlusIEH;
            totalIEH += iehAmount;
            special = iehAmount;
            specialType = 'IEH';
            break;
          }

          case 'electricity': {
            // Electricity: IEE is applied to base before IVA
            const specialRate = sub.specialTaxRate ?? 0.0511;
            const factor = (1 + specialRate) * IVA_FACTOR_21;
            const base = totalPVP / factor;
            special = base * specialRate;
            iva = totalPVP - (totalPVP / IVA_FACTOR_21);
            totalIEE += special;
            specialType = 'IEE';
            break;
          }

          case 'gas': {
            // Natural gas: approximate IEH percentage
            special = totalPVP * GAS_TAX_RATE;
            iva = totalPVP - (totalPVP / IVA_FACTOR_21);
            totalIEH += special;
            specialType = 'IEH (Gas)';
            break;
          }

          case 'alcohol': {
            // Alcohol: approximate excise duty
            special = totalPVP * ALCOHOL_TAX_RATE;
            iva = totalPVP - (totalPVP / IVA_FACTOR_21);
            totalSpecialOthers += special;
            specialType = 'Imp. Alcohol';
            break;
          }

          case 'tobacco': {
            // Tobacco: special tax is ~57% of PVP before IVA
            const pvpSinIVA = totalPVP / IVA_FACTOR_21;
            iva = totalPVP - pvpSinIVA;
            special = pvpSinIVA * TOBACCO_TAX_RATE;
            totalSpecialOthers += special;
            specialType = 'Imp. Tabaco';
            break;
          }

          case 'insurance': {
            // Insurance Premium Tax (IPS) - no IVA
            const specialRate = sub.specialTaxRate ?? 0.06;
            const base = totalPVP / (1 + specialRate);
            special = totalPVP - base;
            iva = 0;
            totalIPS += special;
            specialType = 'IPS';
            break;
          }

          case 'exempt': {
            // Exempt from all taxes
            iva = 0;
            special = 0;
            break;
          }

          case 'standard':
          default: {
            // Standard IVA calculation
            const rateDecimal = sub.ivaRate / 100;
            if (rateDecimal > 0) {
              const base = totalPVP / (1 + rateDecimal);
              iva = totalPVP - base;
            }
            break;
          }
        }

        // Accumulate IVA by rate
        if (sub.ivaRate === 4) totalIVA4 += iva;
        else if (sub.ivaRate === 10) totalIVA10 += iva;
        else if (sub.ivaRate === 21) totalIVA21 += iva;

        detailedItems.push({ name: sub.name, iva, special, type: specialType });
      });
    } else {
      // Simple mode: use IVA distribution percentages
      const monthlyTotal = cat.total;
      const iva4 = (monthlyTotal * (cat.iva4 / 100)) * (4 / 104);
      const iva10 = (monthlyTotal * (cat.iva10 / 100)) * (10 / 110);
      const iva21 = (monthlyTotal * (cat.iva21 / 100)) * (21 / 121);
      totalIVA4 += iva4;
      totalIVA10 += iva10;
      totalIVA21 += iva21;

      if (iva4 + iva10 + iva21 > 0) {
        detailedItems.push({ name: cat.name, iva: iva4 + iva10 + iva21, special: 0, type: '' });
      }
    }
  });

  return {
    iva4: totalIVA4,
    iva10: totalIVA10,
    iva21: totalIVA21,
    ieh: totalIEH,
    ips: totalIPS,
    iee: totalIEE,
    specialOthers: totalSpecialOthers,
    totalIndirect: totalIVA4 + totalIVA10 + totalIVA21 + totalIEH + totalIPS + totalIEE + totalSpecialOthers,
    detailedItems,
  };
};
