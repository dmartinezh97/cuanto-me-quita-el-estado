/**
 * Indirect taxes (IVA and excise duties) calculations.
 */

import type { AppState, IVABreakdown, IVADetailedItem } from '@/types';
import {
  IEH_PER_LITER,
  IVA_FACTOR_21,
  GAS_TAX_RATE,
  ELECTRICITY_TAX_RATE,
  INSURANCE_PREMIUM_TAX_RATE,
  ALCOHOL_TAX_RATE,
  TOBACCO_TAX_RATE,
} from '@fiscal/constants';

// =============================================================================
// IVA and Special Taxes Calculation
// =============================================================================

/**
 * Calculate IVA and special taxes breakdown from expenses.
 *
 * Uses display.taxDisplayType for determining calculation logic instead of
 * hardcoded sub.id checks. This makes the code data-driven and extensible.
 */
export function calculateIVABreakdown(state: AppState): IVABreakdown {
  let totalIVA4 = 0;
  let totalIVA10 = 0;
  let totalIVA21 = 0;
  let totalIEH = 0; // Hydrocarbons tax
  let totalIPS = 0; // Insurance tax
  let totalIEE = 0; // Electricity tax
  let totalSpecialOthers = 0; // Alcohol and Tobacco specific taxes

  const detailedItems: IVADetailedItem[] = [];

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
            const specialRate = sub.specialTaxRate ?? ELECTRICITY_TAX_RATE;
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
            const specialRate = sub.specialTaxRate ?? INSURANCE_PREMIUM_TAX_RATE;
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
}
