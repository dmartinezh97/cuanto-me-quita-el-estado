/**
 * Application state types.
 */

import type { CategoryExpense } from './expenses';

// =============================================================================
// User Profile Types
// =============================================================================

export type MaritalStatus = 'single' | 'married_working' | 'married_not_working';
export type DisabilityLevel = 'none' | '33' | '65' | 'reduced_mobility';
export type ViewMode = 'Mensual' | 'Anual';
export type ConsumptionDetailMode = 'Sencillo' | 'Detallado';

// =============================================================================
// Application State
// =============================================================================

/**
 * Main application state.
 *
 * Contains all user inputs and calculated values.
 */
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
  viewMode: ViewMode;
  consumptionDetailMode: ConsumptionDetailMode;
}
