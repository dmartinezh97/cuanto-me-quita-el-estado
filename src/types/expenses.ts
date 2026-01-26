/**
 * Expense-related type definitions.
 */

// =============================================================================
// Display Configuration Types (Data-Driven UI)
// =============================================================================

/**
 * Types of tax display for sub-items.
 *
 * Used to determine both the visual label and calculation logic.
 * - 'standard': Regular IVA (4%, 10%, 21%)
 * - 'exempt': No tax (education, health, etc.)
 * - 'fuel': IEH per liter + IVA
 * - 'electricity': IEE + IVA
 * - 'gas': Hydrocarbon tax + IVA
 * - 'insurance': IPS (no IVA)
 * - 'alcohol': Alcohol excise + IVA
 * - 'tobacco': Tobacco tax + IVA
 */
export type TaxDisplayType =
  | 'standard'
  | 'exempt'
  | 'fuel'
  | 'electricity'
  | 'gas'
  | 'insurance'
  | 'alcohol'
  | 'tobacco';

/**
 * Input type for expense sub-items.
 * - 'currency': Single currency input with € prefix
 * - 'dual-input': Two inputs (e.g., fuel amount + price per liter)
 */
export type InputType = 'currency' | 'dual-input';

/**
 * Configuration for how a sub-item is displayed in the UI.
 *
 * This replaces hardcoded v-if="sub.id === '...'" checks in templates.
 * All display logic is now data-driven from initialData.ts.
 */
export interface SubItemDisplayConfig {
  /** Type of tax for this item (determines calculation + default label) */
  taxDisplayType: TaxDisplayType;
  /** Custom tax label (overrides default based on taxDisplayType) */
  taxLabel?: string;
  /** Additional note shown below the tax label (e.g., "se calcula al precio medio") */
  taxNote?: string;
  /** Label color: 'red' for taxed items, 'green' for exempt */
  labelColor: 'red' | 'green';
  /** Type of input control */
  inputType: InputType;
  /** For dual-input: label for the second input field */
  secondInputLabel?: string;
}

// =============================================================================
// Expense Types
// =============================================================================

/**
 * A sub-item within an expense category.
 *
 * Examples: "Gasolina", "Electricidad", "Seguro de coche"
 */
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
  /** Display configuration for this sub-item */
  display: SubItemDisplayConfig;
}

/**
 * An expense category containing multiple sub-items.
 *
 * Examples: "Transporte", "Hogar", "Alimentación"
 */
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
