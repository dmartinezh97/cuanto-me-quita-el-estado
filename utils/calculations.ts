
import { AppState } from '../types';

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
          const pricePerLiter = sub.pricePerUnit; // TODO: Call external API for real-time fuel prices
          const liters = totalPVP / pricePerLiter;

          const special = liters * 0.4007;          // TODO: Create a constant for IEH
          const basePlusIEH = totalPVP / 1.21;      // base + IEH (sin IVA) // Create a constant for IVA
          iva = totalPVP - basePlusIEH;            // IVA incluido en el PVP
          const base = basePlusIEH - special;       // base sin impuestos

          totalIEH += special;
          specialType = 'IEH';
        } else if (sub.isElectricityTax && sub.specialTaxRate) {
          const factor = (1 + sub.specialTaxRate) * 1.21;
          const base = totalPVP / factor;
          special = base * sub.specialTaxRate;
          iva = totalPVP - (totalPVP / 1.21);
          totalIEE += special;
          specialType = 'IEE';
        } else if (sub.id === 'gas' && sub.isExciseDuty) {
          special = totalPVP * 0.025; 
          iva = totalPVP - (totalPVP / 1.21);
          totalIEH += special;
          specialType = 'IEH (Gas)';
        } else if (sub.id === 'food_21' && sub.isExciseDuty) {
          special = totalPVP * 0.05;
          iva = totalPVP - (totalPVP / 1.21);
          totalSpecialOthers += special;
          specialType = 'Imp. Alcohol';
        } else if (sub.id === 'tobacco' && sub.isExciseDuty) {
          // El Impuesto Especial del Tabaco se calcula sobre el PVP sin IVA
          // PVP final = (Base + Imp. Especial) * 1.21
          const pvpSinIVA = totalPVP / 1.21;
          iva = totalPVP - pvpSinIVA;
          // El impuesto especial es aproximadamente el 57% del PVP sin IVA
          special = pvpSinIVA * 0.57;
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
