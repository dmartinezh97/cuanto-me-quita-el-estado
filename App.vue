<script setup lang="ts">
import { computed, reactive } from 'vue';
import { INITIAL_STATE } from './constants';
import type { AppState, CategoryExpense, SubItem } from './types';
import {
  formatCurrency,
  calculateIRPF,
  SOCIAL_SECURITY_EMPLOYEE_RATE,
  SOCIAL_SECURITY_EMPLOYER_RATE,
  calculateIVABreakdown,
  RATES_SS_EMPLOYEE,
  RATES_SS_EMPLOYER,
} from './utils/calculations';

type IVAKey = 'iva4' | 'iva10' | 'iva21';

const barcodePattern = [2, 1, 3, 1, 4, 2, 1, 3, 2, 1, 4, 2, 1, 3, 2, 1, 4];

const recalcCategoryTotals = (expenses: CategoryExpense[]): CategoryExpense[] =>
  expenses.map(cat => {
    if (cat.subItems && cat.subItems.length > 0) {
      const total = cat.subItems.reduce((sum, sub) => sum + sub.amount, 0);
      return { ...cat, total };
    }
    return cat;
  });

const createInitialState = (): AppState => {
  const clone = JSON.parse(JSON.stringify(INITIAL_STATE)) as AppState;
  clone.expenses = recalcCategoryTotals(clone.expenses);
  return clone;
};

const state = reactive<AppState>(createInitialState());

const salaryTooltip = reactive({
  visible: false,
  targetElement: null as HTMLElement | null,
  position: { x: 0, y: 0 },
});

const updateState = (patch: Partial<AppState>) => {
  Object.assign(state, patch);
};

const updateExpense = (id: string, patch: Partial<CategoryExpense>) => {
  const expense = state.expenses.find(exp => exp.id === id);
  if (!expense) return;
  Object.assign(expense, patch);
};

const handleSubItemChange = (catId: string, subId: string, patch: Partial<SubItem>) => {
  const expense = state.expenses.find(exp => exp.id === catId);
  if (!expense || !expense.subItems) return;
  const subItem = expense.subItems.find(sub => sub.id === subId);
  if (!subItem) return;
  Object.assign(subItem, patch);
  expense.total = expense.subItems.reduce((sum, sub) => sum + sub.amount, 0);
};

const handleIVAChange = (id: string, type: IVAKey, value: number) => {
  updateExpense(id, { [type]: value } as Partial<CategoryExpense>);
};

const handleAgeInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  state.age = target.value === '' ? '' : Number(target.value);
};

const handleSubAmountInput = (catId: string, subId: string, event: Event) => {
  const target = event.target as HTMLInputElement;
  const newValue = Number(target.value || 0);

  // Obtener el valor actual del subitem
  const expense = state.expenses.find(exp => exp.id === catId);
  const currentSubItem = expense?.subItems?.find(sub => sub.id === subId);
  const currentValue = currentSubItem?.amount || 0;

  // Calcular el máximo valor permitido
  const netSalary = netAnnual.value * displayFactor.value;
  const currentTotalExpenses = totalExpensesMonthly.value * displayFactorExpenses.value;
  const maxAllowed = netSalary - (currentTotalExpenses - currentValue);

  // Limitar el valor al máximo permitido
  const limitedValue = Math.min(Math.max(0, newValue), Math.max(0, maxAllowed));

  // Actualizar el input si el valor fue limitado
  if (limitedValue !== newValue) {
    target.value = limitedValue.toString();
  }

  handleSubItemChange(catId, subId, { amount: limitedValue });
};

const handleSubPriceInput = (catId: string, subId: string, event: Event) => {
  const target = event.target as HTMLInputElement;
  handleSubItemChange(catId, subId, { pricePerUnit: Number(target.value || 0) });
};

const handleCategoryTotalInput = (catId: string, event: Event) => {
  const target = event.target as HTMLInputElement;
  const newValue = Number(target.value || 0);

  // Obtener el valor actual de la categoría
  const expense = state.expenses.find(exp => exp.id === catId);
  const currentValue = expense?.total || 0;

  // Calcular el máximo valor permitido
  const netSalary = netAnnual.value * displayFactor.value;
  const currentTotalExpenses = totalExpensesMonthly.value * displayFactorExpenses.value;
  const maxAllowed = netSalary - (currentTotalExpenses - currentValue);

  // Limitar el valor al máximo permitido
  const limitedValue = Math.min(Math.max(0, newValue), Math.max(0, maxAllowed));

  // Actualizar el input si el valor fue limitado
  if (limitedValue !== newValue) {
    target.value = limitedValue.toString();
  }

  updateExpense(catId, { total: limitedValue });
};

const handleIVASlider = (catId: string, type: IVAKey, event: Event) => {
  const target = event.target as HTMLInputElement;
  handleIVAChange(catId, type, Number(target.value || 0));
};

const updateTooltipPosition = () => {
  if (salaryTooltip.targetElement) {
    const rect = salaryTooltip.targetElement.getBoundingClientRect();
    const modalHeight = 87;
    
    salaryTooltip.position = {
      x: rect.right + 16,
      y: rect.top + (rect.height / 2)
    };
  }
};

const showSalaryTooltip = (event: FocusEvent) => {
  const target = event.target as HTMLElement;
  salaryTooltip.targetElement = target;
  updateTooltipPosition();
  salaryTooltip.visible = true;

  // Añadir listener para scroll
  window.addEventListener('scroll', updateTooltipPosition, true);
  window.addEventListener('resize', updateTooltipPosition);
};

const hideSalaryTooltip = () => {
  salaryTooltip.visible = false;
  salaryTooltip.targetElement = null;

  // Remover listeners
  window.removeEventListener('scroll', updateTooltipPosition, true);
  window.removeEventListener('resize', updateTooltipPosition);
};

const annualGross = computed(() => state.grossSalary);
const employerCostAnnual = computed(() => annualGross.value * (1 + SOCIAL_SECURITY_EMPLOYER_RATE));
const employerSSAnnual = computed(() => annualGross.value * SOCIAL_SECURITY_EMPLOYER_RATE);

const irpfRate = computed(() => calculateIRPF(annualGross.value, state));
const irpfAnnual = computed(() => annualGross.value * irpfRate.value);
const employeeSSAnnual = computed(() => annualGross.value * SOCIAL_SECURITY_EMPLOYEE_RATE);
const netAnnual = computed(() => annualGross.value - irpfAnnual.value - employeeSSAnnual.value);

const indirectTaxes = computed(() => calculateIVABreakdown(state));
const totalExpensesMonthly = computed(() => state.expenses.reduce((acc, cat) => acc + cat.total, 0));
const totalIndirectAnnual = computed(() => indirectTaxes.value.totalIndirect * 12);

const availableSalary = computed(() => {
  const netSalary = netAnnual.value * displayFactor.value;
  const expenses = totalExpensesMonthly.value * displayFactorExpenses.value;
  return netSalary - expenses;
});

const stateShareAnnual = computed(() => employerSSAnnual.value + irpfAnnual.value + employeeSSAnnual.value + totalIndirectAnnual.value);
const userShareAnnual = computed(() => netAnnual.value - totalIndirectAnnual.value);

const isAnnual = computed(() => state.viewMode === 'Anual');
const displayFactor = computed(() => (isAnnual.value ? 1 : 1 / (state.numPayments || 12)));
const displayFactorExpenses = computed(() => (isAnnual.value ? 12 : 1));

const ccAnnual = computed(() => annualGross.value * RATES_SS_EMPLOYEE.CONTINGENCIAS_COMUNES);
const desempAnnual = computed(() => annualGross.value * RATES_SS_EMPLOYEE.DESEMPLEO);
const formAnnual = computed(() => annualGross.value * RATES_SS_EMPLOYEE.FORMACION);
const meiAnnual = computed(() => annualGross.value * RATES_SS_EMPLOYEE.MEI);

const ccEmployerAnnual = computed(() => annualGross.value * RATES_SS_EMPLOYER.CONTINGENCIAS_COMUNES);
const desempEmployerAnnual = computed(() => annualGross.value * RATES_SS_EMPLOYER.DESEMPLEO);
const fogasaEmployerAnnual = computed(() => annualGross.value * RATES_SS_EMPLOYER.FOGASA);
const formEmployerAnnual = computed(() => annualGross.value * RATES_SS_EMPLOYER.FORMACION);
const atepEmployerAnnual = computed(() => annualGross.value * RATES_SS_EMPLOYER.AT_EP);
const meiEmployerAnnual = computed(() => annualGross.value * RATES_SS_EMPLOYER.MEI);

const ivaDistribution: Array<{ key: IVAKey; label: string; color: string }> = [
  { key: 'iva4', label: 'Superreducido (4%)', color: 'emerald' },
  { key: 'iva10', label: 'Reducido (10%)', color: 'amber' },
  { key: 'iva21', label: 'General (21%)', color: 'primary' },
];
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
                  <div class="flex justify-between items-start text-xs font-bold text-stone-500 uppercase mb-1">
                    <label class="pt-1">{{ sub.name }}</label>
                    <span class="text-[10px] text-right">
                      <template v-if="sub.id === 'fuel'">
                        <span class="text-red-600">IEH (€0,4007/L) + IVA 21%</span> <br />
                        <span class="normal-case font-normal italic text-stone-400">se calcula al precio medio de la gasolina</span>
                      </template>
                      <template v-else-if="sub.id === 'insurance_car'">
                        <span class="text-red-600">IPS {{ ((sub.specialTaxRate ?? 0) * 100).toFixed(0) }}% + recargos</span>
                      </template>
                      <template v-else-if="sub.id === 'electricity'">
                        <span class="text-red-600">IVA 21% + IEE</span>
                      </template>
                      <template v-else-if="sub.id === 'gas'">
                        <span class="text-red-600">IVA 21% + Imp. Hidrocarburos (0,00234 €/kWh)</span>
                      </template>
                      <template v-else-if="sub.note">
                        <span 
                          :class="sub.note.toLowerCase().includes('deducible') || sub.note.toLowerCase().includes('sin iva') ? 'text-green-600' : 'text-stone-400'"
                          :style="sub.note.toLowerCase().includes('deducible') || sub.note.toLowerCase().includes('sin iva') ? 'color: rgb(22, 163, 74) !important;' : ''"
                        >{{ sub.note }}</span>
                      </template>
                      <template v-else-if="sub.specialTaxRate && sub.ivaRate === 0">
                        <span class="text-red-600">IPS {{ (sub.specialTaxRate * 100).toFixed(0) }}%</span>
                      </template>
                      <template v-else>
                        <span :class="sub.ivaRate > 0 ? 'text-red-600' : 'text-green-600'">{{ sub.ivaRate > 0 ? `IVA ${sub.ivaRate}%` : 'Exento' }}</span>
                      </template>
                    </span>
                  </div>

                  <div v-if="sub.id === 'fuel'" class="grid grid-cols-2 gap-4 mt-1">
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
                      <label class="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Precio medio €/L</label>
                      <div class="relative">
                    <input
                      class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono text-sm text-stone-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
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
                  </div>
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

            <div class="px-6 py-5 flex flex-col gap-4 border-b border-dashed border-stone-300">
              <div class="flex justify-between items-baseline text-sm font-black text-stone-900 uppercase">
                <span>COSTE TOTAL EMPRESA</span>
                <span class="font-mono">{{ formatCurrency(employerCostAnnual * displayFactor) }}</span>
              </div>

              <div class="h-px bg-stone-200 w-full my-0.5"></div>

              <div class="flex flex-col gap-1.5">
                <div class="flex justify-between items-baseline text-sm text-stone-700 font-medium">
                  <span>Seguridad Social Empresa</span>
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
                    <span class="font-medium">IRPF</span>
                    <span class="text-[10px] text-stone-400 pl-4 uppercase font-mono italic">({{ (irpfRate * 100).toFixed(2) }}%)</span>
                  </div>
                  <span class="font-mono">-{{ formatCurrency(irpfAnnual * displayFactor) }}</span>
                </div>

                <div class="flex flex-col gap-1.5 pt-1">
                  <div class="flex justify-between items-baseline text-[13px] text-stone-700 font-medium">
                    <span>S.S. Trabajador</span>
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
                  <span class="text-stone-800 font-medium">Impuestos Indirectos</span>
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
        v-if="salaryTooltip.visible"
        :style="{
          position: 'fixed',
          left: `${salaryTooltip.position.x}px`,
          top: `${salaryTooltip.position.y}px`,
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
  </div>
</template>
