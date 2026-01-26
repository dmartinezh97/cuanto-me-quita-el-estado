/**
 * Type definitions for the fiscal calculator.
 *
 * This file re-exports all types from their respective modules for convenience.
 */

// State types
export type {
  MaritalStatus,
  DisabilityLevel,
  ViewMode,
  ConsumptionDetailMode,
  AppState,
} from './state';

// Expense types
export type {
  TaxDisplayType,
  InputType,
  SubItemDisplayConfig,
  SubItem,
  CategoryExpense,
} from './expenses';

// Fiscal types
export type {
  IRPFBracket,
  AutonomousCommunity,
} from './fiscal';

// Calculation types
export type {
  SSBreakdown,
  IVADetailedItem,
  IVABreakdown,
} from './calculations';
