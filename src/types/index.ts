export type MaritalStatus = 'single' | 'married_working' | 'married_not_working';
export type DisabilityLevel = 'none' | '33' | '65' | 'reduced_mobility';

export interface SubItem {
  id: string;
  name: string;
  amount: number;
  ivaRate: number; // e.g., 21, 10, 4, 0
  specialTaxRate?: number; // e.g., 0.06 for IPS, 0.0511 for IEE
  isExciseDuty?: boolean; // for Fuel (IEH)
  isElectricityTax?: boolean; // for Electricity (IEE)
  pricePerUnit?: number; // for Fuel volume estimation
  note?: string; // Optional display note (e.g., "Casero paga IRPF")
}

export interface CategoryExpense {
  id: string;
  name: string;
  icon: string;
  color: string;
  total: number;
  iva4: number; // percentage of category total (used if no subItems)
  iva10: number; // percentage of category total (used if no subItems)
  iva21: number; // percentage of category total (used if no subItems)
  open: boolean;
  subItems?: SubItem[];
}

export interface AppState {
  grossSalary: number;
  numPayments: 12 | 14;
  age: number | '';
  region: string;
  maritalStatus: MaritalStatus;
  numChildren: number;
  numChildrenUnder3: number;
  disability: DisabilityLevel;
  expenses: CategoryExpense[];
  viewMode: 'Mensual' | 'Anual';
  consumptionDetailMode: 'Sencillo' | 'Detallado';
}