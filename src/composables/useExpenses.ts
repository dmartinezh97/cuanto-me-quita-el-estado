/**
 * Composable for managing expense categories and sub-items.
 *
 * Why this exists:
 * - Centralizes expense state management (previously scattered in App.vue)
 * - Encapsulates: updateExpense, handleSubItemChange, handleIVAChange
 * - Provides computed total for monthly expenses
 *
 * Contract:
 * - Input: initial expenses array
 * - Output: reactive expenses, update methods, computed totals
 *
 * Invariants:
 * - Category totals always equal sum of subItem amounts
 * - IVA distribution percentages (iva4 + iva10 + iva21) should sum to 100
 *   (only enforced at UI level, not here)
 */

import { reactive, computed, type ComputedRef } from 'vue';
import type { CategoryExpense, SubItem } from '@/types';

export type IVAKey = 'iva4' | 'iva10' | 'iva21';

export interface UseExpensesReturn {
  /** Reactive array of expense categories */
  expenses: CategoryExpense[];

  /** Total monthly expenses across all categories */
  totalMonthly: ComputedRef<number>;

  /**
   * Updates a category's properties (e.g., total, open state, IVA distribution)
   */
  updateExpense: (id: string, patch: Partial<CategoryExpense>) => void;

  /**
   * Updates a sub-item within a category.
   * Automatically recalculates the category total.
   */
  updateSubItem: (catId: string, subId: string, patch: Partial<SubItem>) => void;

  /**
   * Updates IVA distribution for a category (used in simple mode).
   * Shorthand for updateExpense with IVA-specific patch.
   */
  updateIVADistribution: (catId: string, type: IVAKey, value: number) => void;
}

/**
 * Recalculates category total from its sub-items.
 *
 * Called after any sub-item amount change to keep totals in sync.
 */
function recalcCategoryTotal(category: CategoryExpense): void {
  if (category.subItems && category.subItems.length > 0) {
    category.total = category.subItems.reduce(
      (sum, sub) => sum + sub.amount,
      0
    );
  }
}

/**
 * Creates an expense manager with reactive state and update methods.
 *
 * Usage:
 * ```ts
 * const { expenses, totalMonthly, updateExpense, updateSubItem } = useExpenses(
 *   INITIAL_STATE.expenses
 * );
 *
 * // Update a category's open state
 * updateExpense('transport', { open: true });
 *
 * // Update a sub-item's amount
 * updateSubItem('transport', 'fuel', { amount: 200 });
 * ```
 *
 * @param initialExpenses - The initial expense categories (from INITIAL_STATE)
 * @returns Reactive expenses and update methods
 */
export function useExpenses(initialExpenses: CategoryExpense[]): UseExpensesReturn {
  // Deep clone to avoid mutating the original
  const cloned = JSON.parse(JSON.stringify(initialExpenses)) as CategoryExpense[];

  // Ensure all totals are correctly calculated on init
  cloned.forEach(recalcCategoryTotal);

  const expenses = reactive<CategoryExpense[]>(cloned);

  /**
   * Total monthly expenses across all categories.
   *
   * Used to calculate:
   * - Available salary (net - expenses)
   * - Maximum allowed for new expenses (bounded input validation)
   */
  const totalMonthly = computed(() =>
    expenses.reduce((acc, cat) => acc + cat.total, 0)
  );

  /**
   * Updates a category's properties.
   *
   * Common use cases:
   * - Toggle open/closed state: { open: !cat.open }
   * - Update total in simple mode: { total: 500 }
   * - Update IVA distribution: { iva4: 30, iva10: 30, iva21: 40 }
   */
  const updateExpense = (id: string, patch: Partial<CategoryExpense>): void => {
    const expense = expenses.find((exp) => exp.id === id);
    if (!expense) return;
    Object.assign(expense, patch);
  };

  /**
   * Updates a sub-item within a category.
   *
   * Automatically recalculates the parent category's total to keep
   * the sum of sub-items in sync.
   *
   * Common use cases:
   * - Update amount: { amount: 150 }
   * - Update fuel price: { pricePerUnit: 1.75 }
   */
  const updateSubItem = (
    catId: string,
    subId: string,
    patch: Partial<SubItem>
  ): void => {
    const expense = expenses.find((exp) => exp.id === catId);
    if (!expense?.subItems) return;

    const subItem = expense.subItems.find((sub) => sub.id === subId);
    if (!subItem) return;

    Object.assign(subItem, patch);

    // Always recalculate total when sub-item changes
    recalcCategoryTotal(expense);
  };

  /**
   * Shorthand for updating IVA distribution.
   *
   * Used in simple mode where users drag sliders to distribute
   * spending across IVA rates (4%, 10%, 21%).
   */
  const updateIVADistribution = (
    catId: string,
    type: IVAKey,
    value: number
  ): void => {
    updateExpense(catId, { [type]: value } as Partial<CategoryExpense>);
  };

  return {
    expenses,
    totalMonthly,
    updateExpense,
    updateSubItem,
    updateIVADistribution,
  };
}
