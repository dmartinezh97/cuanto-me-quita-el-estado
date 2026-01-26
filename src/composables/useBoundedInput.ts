/**
 * Composable for handling inputs that are bounded by available salary.
 *
 * Why this exists:
 * - Eliminates duplication between handleSubAmountInput and handleCategoryTotalInput
 * - Both functions had identical logic:
 *   1. Get new value from input
 *   2. Calculate max allowed based on (netSalary - otherExpenses)
 *   3. Clamp value to [0, maxAllowed]
 *   4. Update input DOM if value was clamped
 *   5. Call update callback
 *
 * Contract:
 * - Input: current value, net salary, total expenses
 * - Output: clamped value that doesn't exceed available budget
 *
 * Invariants:
 * - Returned value is always >= 0
 * - Returned value never exceeds (netSalary - otherExpenses + currentValue)
 * - Original input is never mutated directly
 */

/**
 * Calculates the bounded value for an expense input.
 *
 * The max allowed is: netSalary - (totalExpenses - currentValue)
 * This ensures the user can't spend more than their available salary.
 *
 * Edge cases:
 * - Negative input → returns 0
 * - Input exceeds available → returns maxAllowed
 * - netSalary < totalExpenses → maxAllowed could be <= currentValue
 *
 * @param newValue - The new value the user is trying to set
 * @param currentValue - The current value of this expense item
 * @param netSalary - Total net salary available (already adjusted for display mode)
 * @param totalExpenses - Sum of all expenses (already adjusted for display mode)
 * @returns The clamped value that respects budget constraints
 */
export function calculateBoundedValue(
  newValue: number,
  currentValue: number,
  netSalary: number,
  totalExpenses: number
): number {
  // Max we can spend: available salary + what we're currently spending on this item
  const maxAllowed = netSalary - (totalExpenses - currentValue);

  // Clamp to [0, maxAllowed], ensuring both bounds are non-negative
  return Math.min(Math.max(0, newValue), Math.max(0, maxAllowed));
}

/**
 * Handles an input event with budget-bounded validation.
 *
 * This is the main entry point that replaces both handleSubAmountInput
 * and handleCategoryTotalInput. It:
 * 1. Extracts the numeric value from the input event
 * 2. Calculates the bounded value
 * 3. Updates the input DOM if the value was clamped
 * 4. Calls the provided update callback with the final value
 *
 * Usage in component:
 * ```ts
 * const handleInput = (event: Event) => {
 *   handleBoundedInput(
 *     event,
 *     currentValue,
 *     netSalary.value * displayFactor.value,
 *     totalExpenses.value * displayFactorExpenses.value,
 *     (value) => updateExpense(id, { total: value })
 *   );
 * };
 * ```
 *
 * @param event - The input event from the DOM
 * @param currentValue - Current value of the expense being edited
 * @param netSalary - Net salary adjusted for display mode
 * @param totalExpenses - Total expenses adjusted for display mode
 * @param onUpdate - Callback to update the state with the bounded value
 */
export function handleBoundedInput(
  event: Event,
  currentValue: number,
  netSalary: number,
  totalExpenses: number,
  onUpdate: (value: number) => void
): void {
  const target = event.target as HTMLInputElement;
  const newValue = Number(target.value || 0);

  const boundedValue = calculateBoundedValue(
    newValue,
    currentValue,
    netSalary,
    totalExpenses
  );

  // Update the input if the value was clamped
  // This provides immediate visual feedback to the user
  if (boundedValue !== newValue) {
    target.value = boundedValue.toString();
  }

  onUpdate(boundedValue);
}
