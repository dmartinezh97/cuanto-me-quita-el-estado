<script setup lang="ts">
/**
 * FiscalCalculator.vue - Main calculator component with two-panel layout.
 *
 * Layout:
 * - Left panel (480px): Input form
 * - Right panel (flex-1): Initial state / Results
 */

import { reactive, ref, computed, watch, nextTick } from 'vue';
import { Calculator } from 'lucide-vue-next';
import { INITIAL_STATE } from '@fiscal/data/initial-state';
import type { AppState, SubItem, CategoryExpense } from '@/types';
import { formatCurrency, SOCIAL_SECURITY_EMPLOYEE_RATE, SOCIAL_SECURITY_EMPLOYER_RATE } from '@fiscal/calculations';
import { ALL_COMMUNITIES } from '@fiscal/constants';

// Composables
import { useTooltip } from '@/composables/useTooltip';
import { useExpenses, type IVAKey } from '@/composables/useExpenses';
import { useFiscalCalculations } from '@/composables/useFiscalCalculations';
import { handleBoundedInput } from '@/composables/useBoundedInput';
import { useLearnMode } from '@/composables/useLearnMode';

// Sub-components
import PersonalDataForm from './PersonalDataForm.vue';
import ExpenseCategories from './ExpenseCategories.vue';
import InitialStateView from './InitialStateView.vue';
import ResultsPanel from '../results/ResultsPanel.vue';
import CategoryEditDialog from '../dialog/CategoryEditDialog.vue';
import LearnModeTopBar from '../ui/LearnModeTopBar.vue';

// =============================================================================
// State
// =============================================================================

/** Whether the user has calculated their fiscal data */
const hasCalculated = ref(false);

/** Ref for scroll target after calculation */
const learnModeBarRef = ref<HTMLElement | null>(null);

/** Category currently being edited in the dialog (null = dialog closed) */
const editingCategory = ref<CategoryExpense | null>(null);

/** Computed visibility for the edit dialog */
const isEditDialogVisible = computed(() => editingCategory.value !== null);

/**
 * Main application state.
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

// Keep state.expenses in sync
state.expenses = expenses;

// Learn mode state
const { isActive: learnModeActive, toggle: toggleLearnMode } = useLearnMode();

// =============================================================================
// Tooltips
// =============================================================================

const salaryTooltip = useTooltip({ anchor: 'right' });
const infoTooltipBase = useTooltip({ anchor: 'bottom' });
const infoTooltipSection = ref<'costeEmpresa' | 'ssEmpresa' | 'salarioBruto' | 'irpf' | 'ssTrabajador' | 'impuestosIndirectos' | ''>('');
const infoTooltipRef = ref<HTMLElement | null>(null);

const infoTooltip = {
  get visible() { return infoTooltipBase.state.visible; },
  get section() { return infoTooltipSection.value; },
  get position() { return infoTooltipBase.state.position; },
  get placement() { return infoTooltipBase.state.placement; },
  get maxHeight() { return infoTooltipBase.state.maxHeight; },
};

watch(() => infoTooltip.visible, async (visible) => {
  if (visible) {
    await nextTick();
    infoTooltipBase.setTooltipRef(infoTooltipRef.value);
    infoTooltipBase.updatePosition();
  }
});

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
// Fiscal Calculations
// =============================================================================

const fiscal = useFiscalCalculations({
  state,
  expenses,
  totalExpensesMonthly,
});

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

// =============================================================================
// Computed
// =============================================================================

/** Whether the form can be calculated */
const canCalculate = computed(() => {
  return state.grossSalary > 0;
});

// =============================================================================
// Event Handlers
// =============================================================================

const updateState = (patch: Partial<AppState>) => {
  Object.assign(state, patch);
};

const handleAgeInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  state.age = target.value === '' ? '' : Number(target.value);
};

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

const handleSubPriceInput = (catId: string, subId: string, event: Event) => {
  const target = event.target as HTMLInputElement;
  updateSubItem(catId, subId, { pricePerUnit: Number(target.value || 0) });
};

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

const handleIVASlider = (catId: string, type: IVAKey, event: Event) => {
  const target = event.target as HTMLInputElement;
  updateIVADistribution(catId, type, Number(target.value || 0));
};

/** Calculate fiscal data */
const calculate = () => {
  if (canCalculate.value) {
    hasCalculated.value = true;
    nextTick(() => {
      (learnModeBarRef.value as any)?.$el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
};

// =============================================================================
// Category Edit Dialog Handlers
// =============================================================================

/** Open the category edit dialog */
const openCategoryEdit = (category: CategoryExpense) => {
  editingCategory.value = category;
};

/** Close the category edit dialog */
const closeCategoryEdit = () => {
  editingCategory.value = null;
};

/** Save changes from the category edit dialog */
const saveCategoryEdit = (
  categoryId: string,
  subItems: Array<{ id: string; amount: number }>
) => {
  // Update each sub-item with its new amount
  for (const item of subItems) {
    updateSubItem(categoryId, item.id, { amount: item.amount });
  }
  // Close the dialog
  editingCategory.value = null;
};

// =============================================================================
// Data-Driven Display Helpers
// =============================================================================

const getLabelColorClass = (sub: SubItem): string => {
  const taxType = sub.display?.taxDisplayType ?? 'standard';
  const hasDoubleTaxation = ['fuel', 'electricity', 'gas', 'alcohol', 'tobacco', 'insurance'].includes(taxType);
  if (hasDoubleTaxation) {
    return 'text-red-600 font-semibold';
  }
  return 'text-stone-500';
};

const getTaxLabel = (sub: SubItem): string => {
  if (sub.display?.taxLabel) {
    return sub.display.taxLabel;
  }
  return sub.ivaRate > 0 ? `IVA ${sub.ivaRate}%` : 'Exento';
};

const isDualInput = (sub: SubItem): boolean => {
  return sub.display?.inputType === 'dual-input';
};

// =============================================================================
// Constants
// =============================================================================

const ivaDistribution: Array<{ key: IVAKey; label: string; color: string }> = [
  { key: 'iva4', label: 'Superreducido (4%)', color: 'emerald' },
  { key: 'iva10', label: 'Reducido (10%)', color: 'amber' },
  { key: 'iva21', label: 'General (21%)', color: 'primary' },
];
</script>

<template>
  <div class="flex flex-col lg:flex-row min-h-screen">
    <!-- Left Panel: Inputs -->
    <div class="w-full lg:w-[480px] flex-shrink-0 bg-surface border-b lg:border-b-0 lg:border-r border-border flex flex-col">
      <div class="flex flex-col gap-6 p-6 lg:p-10 pb-8 lg:pb-12">
        <!-- Header -->
        <div class="flex flex-col gap-2">
          <h1 class="font-display text-[32px] font-medium text-text-primary">
            Calculadora Fiscal
          </h1>
          <p class="text-[14px] text-text-secondary">
            Descubre cuánto te quita realmente el Estado
          </p>
        </div>

        <div class="divider"></div>

        <!-- Personal Data Section -->
        <PersonalDataForm
          :state="state"
          :all-communities="ALL_COMMUNITIES"
          @update-state="updateState"
          @handle-age-input="handleAgeInput"
        />

        <div class="divider"></div>

        <!-- Expense Categories Section -->
        <ExpenseCategories
          :expenses="state.expenses"
          :iva-distribution="ivaDistribution"
          :format-currency="formatCurrency"
          :get-label-color-class="getLabelColorClass"
          :get-tax-label="getTaxLabel"
          :is-dual-input="isDualInput"
          @handle-sub-amount-input="handleSubAmountInput"
          @handle-sub-price-input="handleSubPriceInput"
          @handle-category-total-input="handleCategoryTotalInput"
          @handle-iva-slider="handleIVASlider"
          @show-salary-tooltip="showSalaryTooltip"
          @hide-salary-tooltip="hideSalaryTooltip"
          @open-category-edit="openCategoryEdit"
        />

        <!-- Calculate Button -->
        <button
          @click="calculate"
          :disabled="!canCalculate"
          class="btn-primary w-full"
          :class="{ 'opacity-50 cursor-not-allowed': !canCalculate }"
        >
          <Calculator class="w-5 h-5" />
          <span>Calcular mi carga fiscal</span>
        </button>
      </div>
    </div>

    <!-- Right Panel: Results or Initial State -->
    <div
      class="flex-1 bg-surface-secondary flex justify-center p-6 lg:p-12"
      :class="hasCalculated ? 'items-start overflow-y-auto' : 'items-center lg:sticky lg:top-0 lg:h-screen'"
    >
      <!-- Initial State -->
      <InitialStateView v-if="!hasCalculated" />

      <!-- Results -->
      <div v-else class="flex flex-col gap-4 lg:gap-6 w-full max-w-5xl">
        <!-- Learn Mode Top Bar -->
        <LearnModeTopBar
          ref="learnModeBarRef"
          :is-active="learnModeActive"
          @toggle="toggleLearnMode"
        />

        <!-- Results Panel -->
        <ResultsPanel
          :state="state"
          :fiscal="fiscal"
          :expenses="expenses"
          :format-currency="formatCurrency"
          :learn-mode-active="learnModeActive"
        />
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
        ref="infoTooltipRef"
        @click.stop
        :style="{
          position: 'fixed',
          left: `${infoTooltip.position.x}px`,
          top: `${infoTooltip.position.y}px`,
          transform: 'translate(-50%, 0)',
          zIndex: 9999,
          maxWidth: '380px',
          width: '90vw',
          maxHeight: infoTooltip.maxHeight ? `${infoTooltip.maxHeight}px` : undefined,
          display: 'flex',
          flexDirection: 'column',
        }"
      >
        <div style="position: relative; display: flex; flex-direction: column; min-height: 0;">
          <div
            v-if="infoTooltip.placement === 'below'"
            :style="{
              position: 'absolute',
              left: '50%',
              top: '0',
              transform: 'translate(-50%, -8px)',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderBottom: '8px solid #f5f5f4',
            }"
          ></div>
          <div
            v-else
            :style="{
              position: 'absolute',
              left: '50%',
              bottom: '0',
              transform: 'translate(-50%, 8px)',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid #f5f5f4',
            }"
          ></div>

          <div class="tooltip-card flex flex-col min-h-0">
            <div class="flex items-center justify-between p-3 bg-stone-100 border-b border-stone-300 flex-shrink-0">
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

            <div class="p-4 space-y-3 overflow-y-auto flex-1 min-h-0" :style="{ maxHeight: infoTooltip.maxHeight ? `${infoTooltip.maxHeight - 60}px` : '70vh' }">
              <!-- COSTE EMPRESA -->
              <template v-if="infoTooltip.section === 'costeEmpresa'">
                <p class="text-xs text-stone-600 leading-relaxed">
                  <span class="font-bold text-stone-800">Coste Total para la Empresa:</span> El coste total que asume una empresa por cada empleado incluye el salario bruto más las cotizaciones a la Seguridad Social que paga el empleador.
                </p>
                <div class="bg-white rounded p-3 space-y-1.5 font-mono text-[10px]">
                  <div class="flex justify-between"><span class="text-stone-600">Salario Bruto</span><span class="text-stone-700 font-medium">{{ formatCurrency(annualGross * displayFactor) }}</span></div>
                  <div class="flex justify-between"><span class="text-stone-600">Cuota Patronal</span><span class="text-stone-700 font-medium">+{{ formatCurrency(employerSSAnnual * displayFactor) }}</span></div>
                  <div class="h-px bg-stone-200 my-1"></div>
                  <div class="flex justify-between font-bold"><span class="text-stone-800">Coste Total</span><span class="text-stone-900">{{ formatCurrency(employerCostAnnual * displayFactor) }}</span></div>
                </div>
              </template>

              <!-- SS EMPRESA -->
              <template v-if="infoTooltip.section === 'ssEmpresa'">
                <p class="text-xs text-stone-600 leading-relaxed">
                  <span class="font-bold text-stone-800">Cotizaciones de la Empresa:</span> La empresa cotiza a la Seguridad Social por cada empleado.
                </p>
                <div class="space-y-1.5 font-mono text-[10px] text-stone-600">
                  <div class="flex justify-between bg-white p-2 rounded"><span>Conting. Comunes (23,60%)</span><span class="font-medium">{{ formatCurrency(employerSSBreakdown.contingenciasComunes * displayFactor) }}</span></div>
                  <div class="flex justify-between bg-white p-2 rounded"><span>Desempleo Emp. (5,50%)</span><span class="font-medium">{{ formatCurrency(employerSSBreakdown.desempleo * displayFactor) }}</span></div>
                  <div class="flex justify-between bg-white p-2 rounded"><span>FOGASA (0,20%)</span><span class="font-medium">{{ formatCurrency(employerSSBreakdown.fogasa * displayFactor) }}</span></div>
                  <div class="flex justify-between bg-white p-2 rounded"><span>Formación Prof. (0,60%)</span><span class="font-medium">{{ formatCurrency(employerSSBreakdown.formacion * displayFactor) }}</span></div>
                  <div class="flex justify-between bg-white p-2 rounded"><span>AT y EP (~1,50%)</span><span class="font-medium">{{ formatCurrency(employerSSBreakdown.atEp * displayFactor) }}</span></div>
                  <div class="flex justify-between bg-white p-2 rounded"><span>MEI Empresa (0,58%)</span><span class="font-medium">{{ formatCurrency(employerSSBreakdown.mei * displayFactor) }}</span></div>
                </div>
                <div class="bg-indigo-50 rounded p-3 border border-indigo-100">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-[10px] font-bold uppercase text-indigo-700">Cotización Total Empresa</span>
                    <span class="text-xs font-mono font-bold text-indigo-600">{{ (SOCIAL_SECURITY_EMPLOYER_RATE * 100).toFixed(2) }}%</span>
                  </div>
                  <div class="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div class="h-full bg-indigo-500 rounded-full" :style="{ width: `${(SOCIAL_SECURITY_EMPLOYER_RATE * 100).toFixed(2)}%` }"></div>
                  </div>
                </div>
              </template>

              <!-- IRPF -->
              <template v-if="infoTooltip.section === 'irpf'">
                <p class="text-xs text-stone-600 leading-relaxed">
                  <span class="font-bold text-stone-800">Impuesto sobre la Renta (IRPF):</span> El IRPF es un impuesto progresivo sobre los ingresos.
                </p>
                <p class="text-[10px] italic text-stone-500 leading-relaxed">
                  Tu tipo efectivo actual ({{ (irpfRate * 100).toFixed(2) }}%) representa el porcentaje medio que pagas del total de tu salario bruto.
                </p>
                <div class="bg-indigo-50 rounded p-3 border border-indigo-100">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-[10px] font-bold uppercase text-indigo-700">Tipo Efectivo</span>
                    <span class="text-xs font-mono font-bold text-indigo-600">{{ (irpfRate * 100).toFixed(2) }}%</span>
                  </div>
                  <div class="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div class="h-full bg-indigo-500 rounded-full" :style="{ width: `${Math.min(irpfRate * 100, 100)}%` }"></div>
                  </div>
                </div>
              </template>

              <!-- SS TRABAJADOR -->
              <template v-if="infoTooltip.section === 'ssTrabajador'">
                <p class="text-xs text-stone-600 leading-relaxed">
                  <span class="font-bold text-stone-800">Tus Cotizaciones a la Seguridad Social:</span> Como trabajador, también cotizas a la Seguridad Social ({{ (SOCIAL_SECURITY_EMPLOYEE_RATE * 100).toFixed(2) }}% de tu salario bruto).
                </p>
                <div class="space-y-1.5 font-mono text-[10px] text-stone-600">
                  <div class="flex justify-between bg-white p-2 rounded"><span>Conting. Comunes (4,70%)</span><span class="font-medium">{{ formatCurrency(employeeSSBreakdown.contingenciasComunes * displayFactor) }}</span></div>
                  <div class="flex justify-between bg-white p-2 rounded"><span>Desempleo (1,55%)</span><span class="font-medium">{{ formatCurrency(employeeSSBreakdown.desempleo * displayFactor) }}</span></div>
                  <div class="flex justify-between bg-white p-2 rounded"><span>Formación Prof. (0,10%)</span><span class="font-medium">{{ formatCurrency(employeeSSBreakdown.formacion * displayFactor) }}</span></div>
                  <div class="flex justify-between bg-white p-2 rounded"><span>MEI (0,12%)</span><span class="font-medium">{{ formatCurrency(employeeSSBreakdown.mei * displayFactor) }}</span></div>
                </div>
                <div class="bg-indigo-50 rounded p-3 border border-indigo-100">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-[10px] font-bold uppercase text-indigo-700">Cotización Total Trabajador</span>
                    <span class="text-xs font-mono font-bold text-indigo-600">{{ (SOCIAL_SECURITY_EMPLOYEE_RATE * 100).toFixed(2) }}%</span>
                  </div>
                  <div class="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div class="h-full bg-indigo-500 rounded-full" :style="{ width: `${(SOCIAL_SECURITY_EMPLOYEE_RATE * 100).toFixed(2)}%` }"></div>
                  </div>
                </div>
              </template>

              <!-- IMPUESTOS INDIRECTOS -->
              <template v-if="infoTooltip.section === 'impuestosIndirectos'">
                <p class="text-xs text-stone-600 leading-relaxed">
                  <span class="font-bold text-stone-800">Impuestos sobre el Consumo:</span> Los impuestos indirectos gravan el consumo de bienes y servicios.
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

  <!-- Category Edit Dialog -->
  <CategoryEditDialog
    :visible="isEditDialogVisible"
    :category="editingCategory"
    :format-currency="formatCurrency"
    @close="closeCategoryEdit"
    @save="saveCategoryEdit"
  />
</template>
