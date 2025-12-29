<script setup lang="ts">
/**
 * App.vue - Main application component.
 *
 * Orchestrates the fiscal calculator UI using composables for:
 * - Tooltip management (useTooltip)
 * - Expense state (useExpenses)
 * - Fiscal calculations (useFiscalCalculations)
 * - Input validation (handleBoundedInput)
 */

import { reactive, ref } from 'vue';
import { INITIAL_STATE } from '@/constants/initialData';
import type { AppState, SubItem } from '@/types';
import { formatCurrency, SOCIAL_SECURITY_EMPLOYEE_RATE, SOCIAL_SECURITY_EMPLOYER_RATE } from '@/utils/calculations';
import { ALL_COMMUNITIES } from '@/constants/autonomousCommunities';

// Composables
import { useTooltip } from '@/composables/useTooltip';
import { useExpenses, type IVAKey } from '@/composables/useExpenses';
import { useFiscalCalculations } from '@/composables/useFiscalCalculations';
import { handleBoundedInput } from '@/composables/useBoundedInput';

// =============================================================================
// State
// =============================================================================

/**
 * Main application state.
 * Contains personal data, view preferences, and references expenses from useExpenses.
 */
const state = reactive<AppState>({
  ...JSON.parse(JSON.stringify(INITIAL_STATE)),
});

// Expense management via composable
const {
  expenses,
  totalMonthly: totalExpensesMonthly,
  updateExpense,
  updateSubItem,
  updateIVADistribution,
} = useExpenses(INITIAL_STATE.expenses);

// Keep state.expenses in sync (for template compatibility)
state.expenses = expenses;

// =============================================================================
// Tooltips (using useTooltip composable)
// =============================================================================

// Salary tooltip - appears to the right of focused expense inputs
const salaryTooltip = useTooltip({ anchor: 'right' });

// Info tooltip - appears below info icons, with section tracking
const infoTooltipBase = useTooltip({ anchor: 'bottom' });
const infoTooltipSection = ref<'costeEmpresa' | 'ssEmpresa' | 'salarioBruto' | 'irpf' | 'ssTrabajador' | 'impuestosIndirectos' | ''>('');

// Wrapper for info tooltip to track which section is shown
const infoTooltip = {
  get visible() { return infoTooltipBase.state.visible; },
  get section() { return infoTooltipSection.value; },
  get position() { return infoTooltipBase.state.position; },
};

const showSalaryTooltip = (event: FocusEvent) => {
  salaryTooltip.show(event);
};

const hideSalaryTooltip = () => {
  salaryTooltip.hide();
};

const showInfoTooltip = (section: typeof infoTooltipSection.value, event: MouseEvent) => {
  infoTooltipSection.value = section;
  infoTooltipBase.show(event);
};

const hideInfoTooltip = () => {
  infoTooltipSection.value = '';
  infoTooltipBase.hide();
};

// =============================================================================
// Fiscal Calculations (using useFiscalCalculations composable)
// =============================================================================

const fiscal = useFiscalCalculations({
  state,
  expenses,
  totalExpensesMonthly,
});

// Destructure for template convenience
const {
  annualGross,
  employerCostAnnual,
  employerSSAnnual,
  employerSSBreakdown,
  irpfRate,
  irpfAnnual,
  employeeSSAnnual,
  employeeSSBreakdown,
  netAnnual,
  indirectTaxes,
  totalIndirectAnnual,
  stateShareAnnual,
  userShareAnnual,
  availableSalary,
  displayFactor,
  displayFactorExpenses,
} = fiscal;

// Individual SS breakdown for template (maintaining original variable names)
const ccAnnual = employeeSSBreakdown.value.contingenciasComunes;
const desempAnnual = employeeSSBreakdown.value.desempleo;
const formAnnual = employeeSSBreakdown.value.formacion;
const meiAnnual = employeeSSBreakdown.value.mei;

const ccEmployerAnnual = employerSSBreakdown.value.contingenciasComunes;
const desempEmployerAnnual = employerSSBreakdown.value.desempleo;
const fogasaEmployerAnnual = employerSSBreakdown.value.fogasa;
const formEmployerAnnual = employerSSBreakdown.value.formacion;
const atepEmployerAnnual = employerSSBreakdown.value.atEp;
const meiEmployerAnnual = employerSSBreakdown.value.mei;

// =============================================================================
// Event Handlers
// =============================================================================

/** Updates main application state */
const updateState = (patch: Partial<AppState>) => {
  Object.assign(state, patch);
};

/** Handles age input with empty string support */
const handleAgeInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  state.age = target.value === '' ? '' : Number(target.value);
};

/**
 * Handles sub-item amount input with budget validation.
 * Uses handleBoundedInput to ensure user can't exceed available salary.
 */
const handleSubAmountInput = (catId: string, subId: string, event: Event) => {
  const expense = expenses.find(exp => exp.id === catId);
  const currentSubItem = expense?.subItems?.find(sub => sub.id === subId);
  const currentValue = currentSubItem?.amount || 0;

  handleBoundedInput(
    event,
    currentValue,
    netAnnual.value * displayFactor.value,
    totalExpensesMonthly.value * displayFactorExpenses.value,
    (value) => updateSubItem(catId, subId, { amount: value })
  );
};

/** Handles fuel price per unit input */
const handleSubPriceInput = (catId: string, subId: string, event: Event) => {
  const target = event.target as HTMLInputElement;
  updateSubItem(catId, subId, { pricePerUnit: Number(target.value || 0) });
};

/**
 * Handles category total input with budget validation.
 * Used in simple mode where user enters total for category.
 */
const handleCategoryTotalInput = (catId: string, event: Event) => {
  const expense = expenses.find(exp => exp.id === catId);
  const currentValue = expense?.total || 0;

  handleBoundedInput(
    event,
    currentValue,
    netAnnual.value * displayFactor.value,
    totalExpensesMonthly.value * displayFactorExpenses.value,
    (value) => updateExpense(catId, { total: value })
  );
};

/** Handles IVA distribution slider changes */
const handleIVASlider = (catId: string, type: IVAKey, event: Event) => {
  const target = event.target as HTMLInputElement;
  updateIVADistribution(catId, type, Number(target.value || 0));
};

// =============================================================================
// Constants
// =============================================================================

/** Barcode pattern for ticket decoration */
const barcodePattern = [2, 1, 3, 1, 4, 2, 1, 3, 2, 1, 4, 2, 1, 3, 2, 1, 4];

/** IVA distribution options for sliders */
const ivaDistribution: Array<{ key: IVAKey; label: string; color: string }> = [
  { key: 'iva4', label: 'Superreducido (4%)', color: 'emerald' },
  { key: 'iva10', label: 'Reducido (10%)', color: 'amber' },
  { key: 'iva21', label: 'General (21%)', color: 'primary' },
];

// =============================================================================
// Data-Driven Display Helpers
// =============================================================================

/**
 * Gets the label color class based on display configuration.
 * Only shows red for double taxation (special tax + IVA).
 * Standard IVA and exempt items use default text color.
 */
const getLabelColorClass = (sub: SubItem): string => {
  const taxType = sub.display?.taxDisplayType ?? 'standard';
  // Double taxation types: fuel, electricity, gas, alcohol, tobacco, insurance
  const hasDoubleTaxation = ['fuel', 'electricity', 'gas', 'alcohol', 'tobacco', 'insurance'].includes(taxType);

  if (hasDoubleTaxation) {
    return 'text-red-600 font-semibold';
  }
  // Standard IVA or exempt - use default text color
  return 'text-stone-500';
};

/**
 * Gets the tax label for display.
 * Uses sub.display.taxLabel or falls back to standard IVA display.
 */
const getTaxLabel = (sub: SubItem): string => {
  if (sub.display?.taxLabel) {
    return sub.display.taxLabel;
  }
  // Fallback for items without display config
  return sub.ivaRate > 0 ? `IVA ${sub.ivaRate}%` : 'Exento';
};

/**
 * Checks if sub-item uses dual-input mode (e.g., fuel with price per liter).
 */
const isDualInput = (sub: SubItem): boolean => {
  return sub.display?.inputType === 'dual-input';
};
</script>

<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 flex flex-col font-display">
    <div class="relative flex flex-grow w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8 flex-col lg:flex-row">
      <div class="flex-1 flex flex-col gap-6">
        <header class="flex flex-col gap-2 pb-4 border-b border-stone-200 dark:border-stone-800">
          <h2 class="text-2xl font-bold text-stone-900 dark:text-white">Datos económicos y personales</h2>
          <p class="text-stone-500 dark:text-stone-400 text-sm max-w-2xl">
            Calcula el impacto fiscal de tu nómina y consumo en tiempo real.
          </p>
        </header>

        <div class="flex flex-col gap-4">
          <details class="group bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-stone-200 dark:border-stone-700 overflow-hidden" open>
            <summary class="flex items-center justify-between p-4 cursor-pointer bg-stone-50 dark:bg-slate-800 hover:bg-stone-100 dark:hover:bg-slate-700 transition-colors select-none">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <span class="material-symbols-outlined">payments</span>
                </div>
                <span class="font-semibold text-stone-700 dark:text-stone-200 uppercase tracking-tight text-sm">Datos Económicos</span>
              </div>
              <span class="material-symbols-outlined text-stone-400 transition-transform duration-200 group-open:rotate-180">expand_more</span>
            </summary>
            <div class="p-5 border-t border-stone-100 dark:border-slate-700 flex flex-col gap-6 bg-white dark:bg-slate-800">
              <div>
                <label class="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Salario bruto anual</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-mono">€</span>
                  <input
                    class="w-full pl-8 pr-4 py-2.5 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono text-stone-900 dark:text-white"
                    type="number"
                    min="0"
                    v-model.number="state.grossSalary"
                  />
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Número de pagas</label>
                  <div class="relative">
                    <select
                      class="w-full pl-4 pr-10 py-2.5 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm text-stone-900 dark:text-white appearance-none font-mono"
                      v-model.number="state.numPayments"
                    >
                      <option :value="12">12 pagas</option>
                      <option :value="14">14 pagas</option>
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-500">
                      <span class="material-symbols-outlined text-lg">expand_more</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Edad del trabajador</label>
                  <input
                    class="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono text-stone-900 dark:text-white"
                    type="number"
                    min="0"
                    placeholder="Edad"
                    :value="state.age"
                    @input="handleAgeInput"
                  />
                </div>
              </div>
            </div>
          </details>

          <details class="group bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-stone-200 dark:border-stone-700 overflow-hidden">
            <summary class="flex items-center justify-between p-4 cursor-pointer bg-stone-50 dark:bg-slate-800 hover:bg-stone-100 dark:hover:bg-slate-700 transition-colors select-none">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                  <span class="material-symbols-outlined">family_restroom</span>
                </div>
                <span class="font-semibold text-stone-700 dark:text-stone-200 uppercase tracking-tight text-sm">Situación Personal</span>
              </div>
              <span class="material-symbols-outlined text-stone-400 transition-transform duration-200 group-open:rotate-180">expand_more</span>
            </summary>
            <div class="p-5 border-t border-stone-100 dark:border-slate-700 flex flex-col gap-6 bg-white dark:bg-slate-800">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Número de hijos</label>
                  <input
                    class="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono text-stone-900 dark:text-white"
                    type="number"
                    min="0"
                    step="1"
                    v-model.number="state.numChildren"
                  />
                </div>
                <div>
                  <label class="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Hijos menores de 3 años</label>
                  <input
                    class="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono text-stone-900 dark:text-white"
                    type="number"
                    min="0"
                    step="1"
                    v-model.number="state.numChildrenUnder3"
                  />
                </div>
              </div>
              <div>
                <label class="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Comunidad Autónoma</label>
                <div class="relative">
                  <select
                    class="w-full pl-4 pr-10 py-2.5 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm text-stone-900 dark:text-white appearance-none"
                    v-model="state.region"
                  >
                    <option v-for="cc in ALL_COMMUNITIES" :key="cc.id" :value="cc.id">
                      {{ cc.name }}
                    </option>
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-500">
                    <span class="material-symbols-outlined text-lg">expand_more</span>
                  </div>
                </div>
              </div>
            </div>
          </details>
        </div>

        <div class="h-4 border-b border-dashed border-stone-200 dark:border-stone-800"></div>

        <header class="flex flex-col gap-2 pb-4 border-b border-stone-200 dark:border-stone-800">
          <h2 class="text-2xl font-bold text-stone-900 dark:text-white">Gasto y Consumo Mensual</h2>
          <p class="text-stone-500 dark:text-stone-400 text-sm max-w-2xl">
            Desglosa tus gastos para ver cuánto IVA e impuestos especiales aportas al Estado.
          </p>
        </header>

        <div class="flex flex-col gap-4 pb-12">
          <details
            v-for="cat in state.expenses"
            :key="cat.id"
            class="group bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-stone-200 dark:border-stone-700 overflow-hidden"
          >
            <summary class="flex items-center justify-between py-1 px-3 cursor-pointer bg-stone-50 dark:bg-slate-800 hover:bg-stone-100 dark:hover:bg-slate-700 transition-colors select-none">
              <div class="flex items-center gap-3">
                <div :class="`w-10 h-10 rounded-lg bg-${cat.color}-100 dark:bg-${cat.color}-900/30 text-${cat.color}-600 dark:text-${cat.color}-400 flex items-center justify-center`">
                  <span class="material-symbols-outlined">{{ cat.icon }}</span>
                </div>
                <span class="font-semibold text-stone-700 dark:text-stone-200 uppercase tracking-tight text-sm">{{ cat.name }}</span>
              </div>
              <div class="flex items-center gap-4">
                <span class="font-mono text-sm font-bold text-stone-500">{{ formatCurrency(cat.total) }}</span>
                <span class="material-symbols-outlined text-stone-400 transition-transform duration-200 group-open:rotate-180">expand_more</span>
              </div>
            </summary>
            <div class="p-5 border-t border-stone-100 dark:border-slate-700 flex flex-col gap-6 bg-white dark:bg-slate-800">
              <div v-if="cat.subItems && cat.subItems.length" class="flex flex-col gap-4">
                <div
                  v-for="sub in cat.subItems"
                  :key="sub.id"
                  class="flex flex-col gap-1.5 p-3 bg-stone-50 dark:bg-slate-900/50 rounded-lg border border-stone-100 dark:border-slate-700/50"
                >
                  <!-- Sub-item header with tax info (DATA-DRIVEN) -->
                  <div class="flex justify-between items-start text-xs font-bold text-stone-500 uppercase mb-1">
                    <label class="pt-1">{{ sub.name }}</label>
                    <span class="text-[10px] text-right">
                      <!-- Tax label from display config -->
                      <span :class="getLabelColorClass(sub)">
                        {{ getTaxLabel(sub) }}
                      </span>
                      <!-- Optional tax note -->
                      <template v-if="sub.display?.taxNote">
                        <br />
                        <span class="normal-case font-normal italic text-stone-400">
                          {{ sub.display.taxNote }}
                        </span>
                      </template>
                    </span>
                  </div>

                  <!-- Dual-input mode (e.g., fuel with amount + price per liter) -->
                  <div v-if="isDualInput(sub)" class="grid grid-cols-2 gap-4 mt-1">
                    <div class="flex flex-col gap-1">
                      <label class="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Importe Total</label>
                      <div class="relative">
                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-mono">€</span>
                        <input
                          class="expense-input w-full pl-8 pr-4 py-2 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono text-stone-900 dark:text-white"
                          type="number"
                          min="0"
                          :value="sub.amount"
                          @input="handleSubAmountInput(cat.id, sub.id, $event)"
                          @focus="showSalaryTooltip"
                          @blur="hideSalaryTooltip"
                        />
                      </div>
                    </div>
                    <div class="flex flex-col gap-1">
                      <label class="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                        {{ sub.display?.secondInputLabel ?? 'Precio unitario' }}
                      </label>
                      <input
                        class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono text-sm text-stone-900 dark:text-white"
                        type="number"
                        min="0"
                        step="0.01"
                        :value="sub.pricePerUnit ?? ''"
                        @input="handleSubPriceInput(cat.id, sub.id, $event)"
                        @focus="showSalaryTooltip"
                        @blur="hideSalaryTooltip"
                      />
                    </div>
                  </div>
                  <!-- Standard sub-item: single currency input -->
                  <div v-else class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-mono">€</span>
                    <input
                      class="expense-input w-full pl-8 pr-4 py-2 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono text-stone-900 dark:text-white"
                      type="number"
                      min="0"
                      :value="sub.amount"
                      @input="handleSubAmountInput(cat.id, sub.id, $event)"
                      @focus="showSalaryTooltip"
                      @blur="hideSalaryTooltip"
                    />
                  </div>
                </div>
              </div>
              <template v-else>
                <div>
                  <label class="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Gasto Mensual Total</label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-mono">€</span>
                    <input
                      class="expense-input w-full pl-8 pr-4 py-2.5 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono text-stone-900 dark:text-white"
                      type="number"
                      min="0"
                      :value="cat.total"
                      @input="handleCategoryTotalInput(cat.id, $event)"
                      @focus="showSalaryTooltip"
                      @blur="hideSalaryTooltip"
                    />
                  </div>
                </div>
                <div class="flex flex-col gap-5 p-4 bg-stone-50 dark:bg-slate-900/50 rounded-lg border border-stone-100 dark:border-stone-700/50">
                  <label class="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Distribución estimada de IVA</label>
                  <div
                    v-for="iva in ivaDistribution"
                    :key="iva.key"
                    class="flex flex-col gap-2"
                  >
                    <div class="flex justify-between text-xs font-medium">
                      <span class="text-stone-600 dark:text-stone-300">{{ iva.label }}</span>
                      <span class="font-mono text-stone-500">{{ cat[iva.key] }}%</span>
                    </div>
                    <input
                      class="w-full"
                      type="range"
                      min="0"
                      max="100"
                      :value="cat[iva.key]"
                      @input="handleIVASlider(cat.id, iva.key, $event)"
                    />
                  </div>
                </div>
              </template>
            </div>
          </details>
        </div>
      </div>

      <div class="w-full lg:w-[420px] flex-shrink-0 relative z-10">
        <div class="sticky top-6">
          <div class="relative flex flex-col bg-ticket-bg w-full shadow-ticket rounded-t-md border-t-4 border-t-stone-800">
            <div class="flex flex-col items-center pt-8 pb-4 px-6 gap-2 border-b border-dashed border-stone-300">
              <div class="w-12 h-12 mb-2 bg-stone-900 text-white rounded-full flex items-center justify-center">
                <span class="material-symbols-outlined text-3xl">account_balance</span>
              </div>
              <h1 class="text-stone-900 text-2xl font-black tracking-tight uppercase text-center leading-none">Ticket de Contribución</h1>
              <p class="text-stone-500 text-[10px] font-medium tracking-[0.2em] uppercase mt-2">Versión Fiscal 2024</p>
              <div class="mt-4 w-full">
                <div class="flex h-10 w-full items-center justify-center rounded-lg bg-stone-200/50 p-1">
                  <button
                    @click="updateState({ viewMode: 'Mensual' })"
                    :class="[
                      'flex h-full grow items-center justify-center rounded-md px-2 text-sm font-semibold transition-all',
                      state.viewMode === 'Mensual' ? 'bg-white shadow-sm text-primary' : 'text-stone-500',
                    ]"
                  >
                    Mensual
                  </button>
                  <button
                    @click="updateState({ viewMode: 'Anual' })"
                    :class="[
                      'flex h-full grow items-center justify-center rounded-md px-2 text-sm font-semibold transition-all',
                      state.viewMode === 'Anual' ? 'bg-white shadow-sm text-primary' : 'text-stone-500',
                    ]"
                  >
                    Anual
                  </button>
                </div>
              </div>
            </div>

            <!-- VISTA NORMAL CON ICONOS DE INFO -->
            <div class="px-6 py-5 flex flex-col gap-4 border-b border-dashed border-stone-300">
              <div class="flex justify-between items-baseline text-sm font-black text-stone-900 uppercase">
                <div class="flex items-center gap-1.5">
                  <span>COSTE TOTAL EMPRESA</span>
                  <span 
                    @click="showInfoTooltip('costeEmpresa', $event)"
                    class="material-symbols-outlined text-sm cursor-pointer text-stone-400 hover:text-primary transition-colors"
                    style="font-size: 16px;"
                  >info</span>
                </div>
                <span class="font-mono">{{ formatCurrency(employerCostAnnual * displayFactor) }}</span>
              </div>

              <div class="h-px bg-stone-200 w-full my-0.5"></div>

              <div class="flex flex-col gap-1.5">
                <div class="flex justify-between items-baseline text-sm text-stone-700 font-medium">
                  <div class="flex items-center gap-1.5">
                    <span>Seguridad Social Empresa</span>
                    <span 
                      @click="showInfoTooltip('ssEmpresa', $event)"
                      class="material-symbols-outlined text-xs cursor-pointer text-stone-400 hover:text-primary transition-colors"
                      style="font-size: 14px;"
                    >info</span>
                  </div>
                  <span class="font-mono text-stone-800">-{{ formatCurrency(employerSSAnnual * displayFactor) }}</span>
                </div>
                <div class="flex flex-col gap-0.5 text-[10px] text-stone-400 pl-4 uppercase font-mono italic">
                  <div class="flex justify-between"><span>Conting. Comunes (23,60%)</span><span>{{ formatCurrency(ccEmployerAnnual * displayFactor) }}</span></div>
                  <div class="flex justify-between"><span>Desempleo Emp. (5,50%)</span><span>{{ formatCurrency(desempEmployerAnnual * displayFactor) }}</span></div>
                  <div class="flex justify-between"><span>FOGASA (0,20%)</span><span>{{ formatCurrency(fogasaEmployerAnnual * displayFactor) }}</span></div>
                  <div class="flex justify-between"><span>Formación Prof. (0,60%)</span><span>{{ formatCurrency(formEmployerAnnual * displayFactor) }}</span></div>
                  <div class="flex justify-between"><span>AT y EP (~1,50%)</span><span>{{ formatCurrency(atepEmployerAnnual * displayFactor) }}</span></div>
                  <div class="flex justify-between"><span>MEI Empresa (0,58%)</span><span>{{ formatCurrency(meiEmployerAnnual * displayFactor) }}</span></div>
                </div>
              </div>

              <div class="h-px bg-stone-200 w-full my-0.5"></div>

              <div class="flex justify-between items-baseline text-sm font-bold text-stone-800 uppercase">
                <span>Tu Salario Bruto</span>
                <span class="font-mono">{{ formatCurrency(annualGross * displayFactor) }}</span>
              </div>

              <div class="flex flex-col gap-1.5 mt-1">
                <div class="flex justify-between items-baseline text-[13px] text-stone-700">
                  <div class="flex flex-col">
                    <div class="flex items-center gap-1.5">
                      <span class="font-medium">IRPF</span>
                      <span 
                        @click="showInfoTooltip('irpf', $event)"
                        class="material-symbols-outlined text-xs cursor-pointer text-stone-400 hover:text-primary transition-colors"
                        style="font-size: 14px;"
                      >info</span>
                    </div>
                    <span class="text-[10px] text-stone-400 pl-4 uppercase font-mono italic">({{ (irpfRate * 100).toFixed(2) }}%)</span>
                  </div>
                  <span class="font-mono">-{{ formatCurrency(irpfAnnual * displayFactor) }}</span>
                </div>

                <div class="flex flex-col gap-1.5 pt-1">
                  <div class="flex justify-between items-baseline text-[13px] text-stone-700 font-medium">
                    <div class="flex items-center gap-1.5">
                      <span>S.S. Trabajador</span>
                      <span 
                        @click="showInfoTooltip('ssTrabajador', $event)"
                        class="material-symbols-outlined text-xs cursor-pointer text-stone-400 hover:text-primary transition-colors"
                        style="font-size: 14px;"
                      >info</span>
                    </div>
                    <span class="font-mono">-{{ formatCurrency(employeeSSAnnual * displayFactor) }}</span>
                  </div>
                  <div class="flex flex-col gap-0.5 text-[10px] text-stone-400 pl-4 uppercase font-mono italic">
                    <div class="flex justify-between"><span>Conting. Comunes (4,70%)</span><span>{{ formatCurrency(ccAnnual * displayFactor) }}</span></div>
                    <div class="flex justify-between"><span>Desempleo (1,55%)</span><span>{{ formatCurrency(desempAnnual * displayFactor) }}</span></div>
                    <div class="flex justify-between"><span>Formación Prof. (0,10%)</span><span>{{ formatCurrency(formAnnual * displayFactor) }}</span></div>
                    <div class="flex justify-between"><span>MEI (0,12%)</span><span>{{ formatCurrency(meiAnnual * displayFactor) }}</span></div>
                  </div>
                </div>
              </div>

              <div class="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20 flex flex-col gap-1">
                <div class="flex justify-between items-center">
                  <span class="text-xs font-bold text-primary uppercase tracking-wide">Neto a tu Cuenta</span>
                  <span class="material-symbols-outlined text-primary text-sm">account_balance_wallet</span>
                </div>
                <div class="flex justify-between items-baseline">
                  <span class="text-xs text-stone-500">Transferencia Real</span>
                  <span class="font-mono text-xl font-bold text-primary">{{ formatCurrency(netAnnual * displayFactor) }}</span>
                </div>
              </div>
            </div>

            <div class="px-6 py-5 flex flex-col gap-3 border-b-2 border-stone-800">
              <div class="flex items-center justify-between mb-1">
                <h3 class="text-stone-800 text-sm font-bold uppercase tracking-wider">2. Consumo Est.</h3>
                <div class="flex h-7 items-center rounded-md bg-stone-200/50 p-0.5 border border-stone-300">
                  <button
                    @click="updateState({ consumptionDetailMode: 'Sencillo' })"
                    :class="[
                      'h-full px-2 text-[10px] font-bold uppercase rounded transition-all',
                      state.consumptionDetailMode === 'Sencillo' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500',
                    ]"
                  >
                    Simple
                  </button>
                  <button
                    @click="updateState({ consumptionDetailMode: 'Detallado' })"
                    :class="[
                      'h-full px-2 text-[10px] font-bold uppercase rounded transition-all',
                      state.consumptionDetailMode === 'Detallado' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500',
                    ]"
                  >
                    Detalle
                  </button>
                </div>
              </div>

              <div class="flex justify-between items-baseline text-sm text-stone-600">
                <span>Gasto Disponible</span>
                <span class="font-mono">{{ formatCurrency(totalExpensesMonthly * displayFactorExpenses) }}</span>
              </div>

              <div class="pl-3 border-l-2 border-dashed border-stone-300 flex flex-col gap-2 py-1">
                <div class="flex justify-between items-baseline text-sm">
                  <div class="flex items-center gap-1.5">
                    <span class="text-stone-800 font-medium">Impuestos Indirectos</span>
                    <span 
                      @click="showInfoTooltip('impuestosIndirectos', $event)"
                      class="material-symbols-outlined text-xs cursor-pointer text-stone-400 hover:text-primary transition-colors"
                      style="font-size: 14px;"
                    >info</span>
                  </div>
                  <span class="font-mono font-medium text-stone-800">
                    {{ formatCurrency(indirectTaxes.totalIndirect * displayFactorExpenses) }}
                  </span>
                </div>

                <div v-if="state.consumptionDetailMode === 'Sencillo'" class="flex flex-col gap-1 text-[10px] text-stone-500 font-mono uppercase italic">
                  <div class="flex justify-between"><span>IVA General (21%)</span><span>{{ formatCurrency(indirectTaxes.iva21 * displayFactorExpenses) }}</span></div>
                  <div class="flex justify-between"><span>IVA Reducido (10%)</span><span>{{ formatCurrency(indirectTaxes.iva10 * displayFactorExpenses) }}</span></div>
                  <div class="flex justify-between">
                    <span>Imp. Especiales (IEH/IEE/IPS/Alc/Tab)</span>
                    <span>{{ formatCurrency((indirectTaxes.ieh + indirectTaxes.ips + indirectTaxes.iee + indirectTaxes.specialOthers) * displayFactorExpenses) }}</span>
                  </div>
                </div>
                <div v-else class="flex flex-col gap-2 pt-1">
                  <div
                    v-for="(item, idx) in indirectTaxes.detailedItems"
                    :key="`${item.name}-${idx}`"
                    class="flex flex-col gap-0.5 text-[10px] text-stone-400 font-mono uppercase italic border-b border-stone-100/50 pb-1 last:border-0"
                  >
                    <div class="flex justify-between text-stone-500 font-bold">
                      <span>{{ item.name }}</span>
                    </div>
                    <div v-if="item.iva > 0" class="flex justify-between pl-2">
                      <span>IVA Aplicado</span>
                      <span>{{ formatCurrency(item.iva * displayFactorExpenses) }}</span>
                    </div>
                    <div v-if="item.special > 0" class="flex justify-between pl-2 text-primary font-bold">
                      <span>{{ item.type }} Especial</span>
                      <span>{{ formatCurrency(item.special * displayFactorExpenses) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="px-6 py-6 bg-stone-100/50 flex flex-col gap-4">
              <div class="flex justify-between items-end">
                <div class="flex flex-col">
                  <span class="text-[10px] text-stone-500 uppercase font-bold tracking-wider">Contribución Total</span>
                  <span class="text-[10px] text-stone-400">Estado S.L. se queda</span>
                </div>
                <span class="font-mono text-lg font-bold text-stone-800">
                  {{ formatCurrency(stateShareAnnual * displayFactor) }}
                </span>
              </div>
              <div class="flex justify-between items-end">
                <div class="flex flex-col">
                  <span class="text-[10px] text-primary uppercase font-bold tracking-wider">Tu Libertad Fiscal</span>
                  <span class="text-[10px] text-stone-400">Tú te quedas</span>
                </div>
                <span class="font-mono text-lg font-bold text-primary">
                  {{ formatCurrency(userShareAnnual * displayFactor) }}
                </span>
              </div>

              <div class="mt-2 w-full h-2 bg-stone-200 rounded-full overflow-hidden flex">
                <div
                  class="h-full bg-stone-800 transition-all duration-500"
                  :style="{ width: `${(stateShareAnnual / (employerCostAnnual || 1)) * 100}%` }"
                />
                <div
                  class="h-full bg-primary transition-all duration-500"
                  :style="{ width: `${(userShareAnnual / (employerCostAnnual || 1)) * 100}%` }"
                />
              </div>
              <div class="flex justify-between text-[10px] font-mono text-stone-500 uppercase">
                <span>{{ Math.round((stateShareAnnual / (employerCostAnnual || 1)) * 100) }}% Estado</span>
                <span>{{ Math.round((userShareAnnual / (employerCostAnnual || 1)) * 100) }}% Tú</span>
              </div>
            </div>

            <div class="px-6 pb-8 pt-4 text-center border-t border-dashed border-stone-300">
              <p class="font-mono text-[10px] text-stone-400 mb-2 tracking-widest">***********************************</p>
              <p class="text-xs text-stone-500 font-medium italic">"Gracias por su contribución obligatoria."</p>
              <div class="mt-6 flex justify-center opacity-50">
                <div class="h-8 flex items-end gap-[2px]">
                  <div
                    v-for="(width, index) in barcodePattern"
                    :key="`bar-${index}`"
                    class="bg-stone-800"
                    :style="{ width: `${width}px`, height: `${index % 5 === 0 ? 32 : index % 3 === 0 ? 24 : 16}px` }"
                  />
                </div>
              </div>
            </div>
            <div class="ticket-bottom"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Popup contextual de sueldo disponible -->
    <Teleport to="body">
      <div
        v-if="salaryTooltip.state.visible"
        :style="{
          position: 'fixed',
          left: `${salaryTooltip.state.position.x}px`,
          top: `${salaryTooltip.state.position.y}px`,
          transform: 'translate(0, -50%)',
          zIndex: 9999,
          pointerEvents: 'none',
        }"
      >
        <div style="position: relative;">
          <!-- Flecha apuntando a la izquierda -->
          <div :style="{
            position: 'absolute',
            left: '0',
            top: '50%',
            transform: 'translate(-8px, -50%)',
            width: 0,
            height: 0,
            borderTop: '8px solid transparent',
            borderRight: '8px solid #b91c1c',
            borderBottom: '8px solid transparent',
          }"></div>

          <!-- Contenido del popup -->
          <div :style="{
            backgroundColor: '#b91c1c',
            color: 'white',
            borderRadius: '8px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            minWidth: '280px',
          }">
            <div style="flex: 1;">
              <div :style="{
                fontSize: '10px',
                fontWeight: 'bold',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: '#fecaca',
                marginBottom: '4px',
              }">Sueldo Disponible</div>
              <div :style="{
                fontSize: '24px',
                fontWeight: 'bold',
                fontFamily: 'monospace',
              }">{{ formatCurrency(availableSalary) }}</div>
            </div>
            <div :style="{
              width: '40px',
              height: '40px',
              backgroundColor: '#991b1b',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }">
              <span class="material-symbols-outlined" style="font-size: 24px;">account_balance_wallet</span>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Info Tooltip -->
    <Teleport to="body">
      <div
        v-if="infoTooltip.visible"
        @click="hideInfoTooltip"
        :style="{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(2px)',
        }"
      >
        <div
          @click.stop
          :style="{
            position: 'fixed',
            left: `${infoTooltip.position.x}px`,
            top: `${infoTooltip.position.y}px`,
            transform: 'translate(-50%, 0)',
            zIndex: 9999,
            maxWidth: '380px',
            width: '90vw',
          }"
        >
          <div style="position: relative;">
            <!-- Flecha apuntando arriba -->
            <div :style="{
              position: 'absolute',
              left: '50%',
              top: '0',
              transform: 'translate(-50%, -8px)',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderBottom: '8px solid #f5f5f4',
            }"></div>

            <!-- Contenido del tooltip -->
            <div class="bg-ticket-bg rounded-lg shadow-2xl border border-stone-300 overflow-hidden">
              <!-- Header con botón cerrar -->
              <div class="flex items-center justify-between p-3 bg-stone-100 border-b border-stone-300">
                <h4 class="text-xs font-bold text-stone-800 uppercase tracking-wide">
                  {{ infoTooltip.section === 'costeEmpresa' ? 'Coste Total Empresa' : '' }}
                  {{ infoTooltip.section === 'ssEmpresa' ? 'Seguridad Social Empresa' : '' }}
                  {{ infoTooltip.section === 'irpf' ? 'IRPF' : '' }}
                  {{ infoTooltip.section === 'ssTrabajador' ? 'S.S. Trabajador' : '' }}
                  {{ infoTooltip.section === 'impuestosIndirectos' ? 'Impuestos Indirectos' : '' }}
                </h4>
                <button 
                  @click="hideInfoTooltip"
                  class="text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <span class="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <!-- Contenido según sección -->
              <div class="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
                
                <!-- COSTE EMPRESA -->
                <template v-if="infoTooltip.section === 'costeEmpresa'">
                  <p class="text-xs text-stone-600 leading-relaxed">
                    <span class="font-bold text-stone-800">La Mentira del Bruto:</span> Tu empresa no paga {{ formatCurrency(annualGross * displayFactor) }}. Paga casi {{ formatCurrency(employerCostAnnual * displayFactor) }} por ti. La diferencia (casi {{ formatCurrency(employerSSAnnual * displayFactor) }}) se la queda el Estado antes de que tú siquiera veas la nómina, haciéndote creer que cobras menos para que te duela menos el robo.
                  </p>
                  <div class="bg-white rounded p-3 space-y-1.5 font-mono text-[10px]">
                    <div class="flex justify-between"><span class="text-stone-600">Salario Bruto (Lo que ves)</span><span class="text-stone-700 font-medium">{{ formatCurrency(annualGross * displayFactor) }}</span></div>
                    <div class="flex justify-between"><span class="text-red-600 font-medium">Cuota Patronal (Oculto)</span><span class="text-red-600 font-bold">+{{ formatCurrency(employerSSAnnual * displayFactor) }}</span></div>
                    <div class="h-px bg-stone-200 my-1"></div>
                    <div class="flex justify-between font-bold"><span class="text-stone-800">Coste Real (Tu valor)</span><span class="text-stone-900">{{ formatCurrency(employerCostAnnual * displayFactor) }}</span></div>
                  </div>
                </template>

                <!-- SS EMPRESA -->
                <template v-if="infoTooltip.section === 'ssEmpresa'">
                  <p class="text-xs text-stone-600 leading-relaxed">
                    <span class="font-bold text-stone-800">El impuesto fantasma.</span> Tu empleador paga esto por ti cada mes sin que lo sepas. No aparece en tu nómina, pero existe. Si este dinero fuera tuyo, podrías decidir en qué gastarlo: ahorro, inversión, o simplemente vivir mejor. Pero el Estado decide por ti.
                  </p>
                  <div class="space-y-1.5 font-mono text-[10px] text-stone-600">
                    <div class="flex justify-between bg-white p-2 rounded"><span>Conting. Comunes (23,60%)</span><span class="font-medium">{{ formatCurrency(ccEmployerAnnual * displayFactor) }}</span></div>
                    <div class="flex justify-between bg-white p-2 rounded"><span>Desempleo Emp. (5,50%)</span><span class="font-medium">{{ formatCurrency(desempEmployerAnnual * displayFactor) }}</span></div>
                    <div class="flex justify-between bg-white p-2 rounded"><span>FOGASA (0,20%)</span><span class="font-medium">{{ formatCurrency(fogasaEmployerAnnual * displayFactor) }}</span></div>
                    <div class="flex justify-between bg-white p-2 rounded"><span>Formación Prof. (0,60%)</span><span class="font-medium">{{ formatCurrency(formEmployerAnnual * displayFactor) }}</span></div>
                    <div class="flex justify-between bg-white p-2 rounded"><span>AT y EP (~1,50%)</span><span class="font-medium">{{ formatCurrency(atepEmployerAnnual * displayFactor) }}</span></div>
                    <div class="flex justify-between bg-white p-2 rounded"><span>MEI Empresa (0,58%)</span><span class="font-medium">{{ formatCurrency(meiEmployerAnnual * displayFactor) }}</span></div>
                  </div>
                  <div class="bg-red-50 rounded p-3 border border-red-100">
                    <div class="flex justify-between items-center mb-2">
                      <span class="text-[10px] font-bold uppercase text-red-700">Confiscación Oculta</span>
                      <span class="text-xs font-mono font-bold text-red-600">{{ (SOCIAL_SECURITY_EMPLOYER_RATE * 100).toFixed(2) }}%</span>
                    </div>
                    <div class="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div class="h-full bg-red-500 rounded-full" :style="{ width: `${(SOCIAL_SECURITY_EMPLOYER_RATE * 100).toFixed(2)}%` }"></div>
                    </div>
                  </div>
                </template>

                <!-- IRPF -->
                <template v-if="infoTooltip.section === 'irpf'">
                  <p class="text-xs text-stone-600 leading-relaxed">
                    <span class="font-bold text-stone-800">El "alquiler" por trabajar.</span> De tu esfuerzo bruto, el Estado sustrae un {{ (irpfRate * 100).toFixed(1) }}% preventivamente. No es dinero para carreteras, es dinero que pierdes de tu poder adquisitivo inmediato para mantener una estructura burocrática insaciable.
                  </p>
                  <p class="text-[10px] italic text-stone-500 leading-relaxed">
                    Este porcentaje varía según tus circunstancias personales. Cuanto más ganas, más te quitan proporcionalmente. El sistema progresivo castiga el éxito y desincentiva el esfuerzo adicional.
                  </p>
                  <div class="bg-red-50 rounded p-3 border border-red-100">
                    <div class="flex justify-between items-center mb-2">
                      <span class="text-[10px] font-bold uppercase text-red-700">Confiscación sobre Bruto</span>
                      <span class="text-xs font-mono font-bold text-red-600">{{ (irpfRate * 100).toFixed(2) }}%</span>
                    </div>
                    <div class="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div class="h-full bg-red-500 rounded-full" :style="{ width: `${Math.min(irpfRate * 100, 100)}%` }"></div>
                    </div>
                  </div>
                </template>

                <!-- SS TRABAJADOR -->
                <template v-if="infoTooltip.section === 'ssTrabajador'">
                  <p class="text-xs text-stone-600 leading-relaxed">
                    <span class="font-bold text-stone-800">La segunda mordida.</span> Además de lo que paga tu empresa (que no ves), tú también pagas Seguridad Social. Un {{ (SOCIAL_SECURITY_EMPLOYEE_RATE * 100).toFixed(2) }}% de tu bruto que se esfuma antes de llegar a tu cuenta. Te dicen que es para tu jubilación, pero nadie te garantiza que ese dinero estará cuando lo necesites.
                  </p>
                  <div class="space-y-1.5 font-mono text-[10px] text-stone-600">
                    <div class="flex justify-between bg-white p-2 rounded"><span>Conting. Comunes (4,70%)</span><span class="font-medium">{{ formatCurrency(ccAnnual * displayFactor) }}</span></div>
                    <div class="flex justify-between bg-white p-2 rounded"><span>Desempleo (1,55%)</span><span class="font-medium">{{ formatCurrency(desempAnnual * displayFactor) }}</span></div>
                    <div class="flex justify-between bg-white p-2 rounded"><span>Formación Prof. (0,10%)</span><span class="font-medium">{{ formatCurrency(formAnnual * displayFactor) }}</span></div>
                    <div class="flex justify-between bg-white p-2 rounded"><span>MEI (0,12%)</span><span class="font-medium">{{ formatCurrency(meiAnnual * displayFactor) }}</span></div>
                  </div>
                  <div class="bg-red-50 rounded p-3 border border-red-100">
                    <div class="flex justify-between items-center mb-2">
                      <span class="text-[10px] font-bold uppercase text-red-700">Confiscación Adicional</span>
                      <span class="text-xs font-mono font-bold text-red-600">{{ (SOCIAL_SECURITY_EMPLOYEE_RATE * 100).toFixed(2) }}%</span>
                    </div>
                    <div class="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div class="h-full bg-red-500 rounded-full" :style="{ width: `${(SOCIAL_SECURITY_EMPLOYEE_RATE * 100).toFixed(2)}%` }"></div>
                    </div>
                  </div>
                </template>

                <!-- IMPUESTOS INDIRECTOS -->
                <template v-if="infoTooltip.section === 'impuestosIndirectos'">
                  <p class="text-xs text-stone-600 leading-relaxed">
                    <span class="font-bold text-stone-800">El tercer asalto.</span> Después de haberte quitado casi el {{ Math.round(((employerSSAnnual + irpfAnnual + employeeSSAnnual) / employerCostAnnual) * 100) }}% antes de cobrar, el Estado vuelve a la carga cuando gastas lo poco que te queda. Cada compra incluye IVA, impuestos especiales sobre combustibles, electricidad, alcohol, tabaco... No hay escapatoria.
                  </p>
                  <div class="space-y-1.5 font-mono text-[10px] text-stone-600">
                    <div v-if="indirectTaxes.iva21 * displayFactorExpenses > 0" class="flex justify-between bg-white p-2 rounded"><span>IVA General (21%)</span><span class="font-medium">{{ formatCurrency(indirectTaxes.iva21 * displayFactorExpenses) }}</span></div>
                    <div v-if="indirectTaxes.iva10 * displayFactorExpenses > 0" class="flex justify-between bg-white p-2 rounded"><span>IVA Reducido (10%)</span><span class="font-medium">{{ formatCurrency(indirectTaxes.iva10 * displayFactorExpenses) }}</span></div>
                    <div v-if="indirectTaxes.iva4 * displayFactorExpenses > 0" class="flex justify-between bg-white p-2 rounded"><span>IVA Superreducido (4%)</span><span class="font-medium">{{ formatCurrency(indirectTaxes.iva4 * displayFactorExpenses) }}</span></div>
                    <div v-if="indirectTaxes.ieh * displayFactorExpenses > 0" class="flex justify-between bg-white p-2 rounded"><span>Imp. Hidrocarburos</span><span class="font-medium">{{ formatCurrency(indirectTaxes.ieh * displayFactorExpenses) }}</span></div>
                    <div v-if="indirectTaxes.iee * displayFactorExpenses > 0" class="flex justify-between bg-white p-2 rounded"><span>Imp. Electricidad</span><span class="font-medium">{{ formatCurrency(indirectTaxes.iee * displayFactorExpenses) }}</span></div>
                    <div v-if="indirectTaxes.ips * displayFactorExpenses > 0" class="flex justify-between bg-white p-2 rounded"><span>Imp. Primas Seguros</span><span class="font-medium">{{ formatCurrency(indirectTaxes.ips * displayFactorExpenses) }}</span></div>
                    <div v-if="indirectTaxes.specialOthers * displayFactorExpenses > 0" class="flex justify-between bg-white p-2 rounded"><span>Otros (Alcohol/Tabaco)</span><span class="font-medium">{{ formatCurrency(indirectTaxes.specialOthers * displayFactorExpenses) }}</span></div>
                  </div>
                </template>

              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Footer -->
    <footer class="w-full bg-stone-100 dark:bg-slate-900 border-t border-stone-200 dark:border-stone-700 py-6 mt-8">
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <p class="text-center text-sm text-stone-600 dark:text-stone-400">
          La información proporcionada puede contener errores. Si encuentras algún error o tienes sugerencias de mejora, por favor contacta con
          <a href="mailto:example@gmail.com" class="text-primary hover:underline font-medium">example@gmail.com</a>.
        </p>
      </div>
    </footer>
  </div>
</template>
