import type { AppState } from '@/types';
import {
  IEH_PER_LITER,
  IVA_FACTOR_21,
  GAS_TAX_RATE,
  ALCOHOL_TAX_RATE,
  TOBACCO_TAX_RATE,
} from '@/constants/taxes';

export const calculateIRPF = (gross: number, state: AppState): number => {
  let baseMinimum = 5550;
  if (state.numChildren > 0) baseMinimum += state.numChildren * 2400;
  if (state.numChildrenUnder3 > 0) baseMinimum += state.numChildrenUnder3 * 1200;
  
  const taxableIncome = Math.max(0, gross - baseMinimum);

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

export const RATES_SS_EMPLOYER = {
  CONTINGENCIAS_COMUNES: 0.2360,
  DESEMPLEO: 0.0550, 
  FOGASA: 0.0020,
  FORMACION: 0.0060,
  MEI: 0.0058, 
  AT_EP: 0.0150, 
};

export const RATES_SS_EMPLOYEE = {
  CONTINGENCIAS_COMUNES: 0.0470,
  DESEMPLEO: 0.0155,
  FORMACION: 0.0010,
  MEI: 0.0012,
};

export const SOCIAL_SECURITY_EMPLOYEE_RATE = 0.0647;
export const SOCIAL_SECURITY_EMPLOYER_RATE = 0.3198;

export const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

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

        if (sub.id === 'fuel' && sub.isExciseDuty) {
          // Fuel: IEH is a fixed amount per liter
          const pricePerLiter = sub.pricePerUnit;
          const liters = totalPVP / pricePerLiter;

          const iehAmount = liters * IEH_PER_LITER;
          const basePlusIEH = totalPVP / IVA_FACTOR_21;
          iva = totalPVP - basePlusIEH;

          totalIEH += iehAmount;
          special = iehAmount;
          specialType = 'IEH';
        } else if (sub.isElectricityTax && sub.specialTaxRate) {
          // Electricity: IEE is applied to base before IVA
          const factor = (1 + sub.specialTaxRate) * IVA_FACTOR_21;
          const base = totalPVP / factor;
          special = base * sub.specialTaxRate;
          iva = totalPVP - (totalPVP / IVA_FACTOR_21);
          totalIEE += special;
          specialType = 'IEE';
        } else if (sub.id === 'gas' && sub.isExciseDuty) {
          // Natural gas: approximate IEH percentage
          special = totalPVP * GAS_TAX_RATE;
          iva = totalPVP - (totalPVP / IVA_FACTOR_21);
          totalIEH += special;
          specialType = 'IEH (Gas)';
        } else if (sub.id === 'food_21' && sub.isExciseDuty) {
          // Alcohol: approximate excise duty
          special = totalPVP * ALCOHOL_TAX_RATE;
          iva = totalPVP - (totalPVP / IVA_FACTOR_21);
          totalSpecialOthers += special;
          specialType = 'Imp. Alcohol';
        } else if (sub.id === 'tobacco' && sub.isExciseDuty) {
          // Tobacco: special tax is ~57% of PVP before IVA
          const pvpSinIVA = totalPVP / IVA_FACTOR_21;
          iva = totalPVP - pvpSinIVA;
          special = pvpSinIVA * TOBACCO_TAX_RATE;
          totalSpecialOthers += special;
          specialType = 'Imp. Tabaco';
        } else if (sub.specialTaxRate && sub.ivaRate === 0) {
          // Insurance Premium Tax (IPS) handling
          const base = totalPVP / (1 + sub.specialTaxRate);
          special = totalPVP - base;
          iva = 0;
          totalIPS += special;
          specialType = 'IPS';
        } else {
          const rateDecimal = sub.ivaRate / 100;
          const base = totalPVP / (1 + rateDecimal);
          iva = totalPVP - base;
        }

        if (sub.ivaRate === 4) totalIVA4 += iva;
        else if (sub.ivaRate === 10) totalIVA10 += iva;
        else if (sub.ivaRate === 21) totalIVA21 += iva;

        detailedItems.push({ name: sub.name, iva, special, type: specialType });
      });
    } else {
      const monthlyTotal = cat.total;
      const iva4 = (monthlyTotal * (cat.iva4 / 100)) * (4/104);
      const iva10 = (monthlyTotal * (cat.iva10 / 100)) * (10/110);
      const iva21 = (monthlyTotal * (cat.iva21 / 100)) * (21/121);
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
    detailedItems
  };
};
