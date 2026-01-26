/**
 * Initial application state configuration.
 */

import type { AppState } from '@/types';
import { INITIAL_EXPENSES } from './initial-expenses';

/**
 * Default application state.
 *
 * Represents a typical Spanish worker profile:
 * - Average salary: 28,000 EUR/year
 * - 12 payments (no extra pagas)
 * - Single, no children
 * - Living in Madrid
 */
export const INITIAL_STATE: AppState = {
  grossSalary: 28000,
  numPayments: 12,
  age: '',
  region: 'madrid',
  maritalStatus: 'single',
  numChildren: 0,
  numChildrenUnder3: 0,
  disability: 'none',
  expenses: INITIAL_EXPENSES,
  viewMode: 'Mensual',
  consumptionDetailMode: 'Sencillo',
  learnMode: false,
};
