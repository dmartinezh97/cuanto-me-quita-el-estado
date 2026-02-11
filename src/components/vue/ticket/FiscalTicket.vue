<script setup lang="ts">
/**
 * FiscalTicket.vue - Fiscal ticket showing tax breakdown.
 *
 * Displays a receipt-style breakdown of:
 * - Employer cost and SS contributions
 * - Gross salary
 * - Employee deductions (IRPF, SS)
 * - Net salary
 * - Indirect taxes (IVA, excise duties)
 * - Final summary (state share vs user share)
 */

import { computed, type ComputedRef } from 'vue';
import type { AppState, ViewMode } from '@/types';
import type { UseFiscalCalculationsReturn } from '@/composables/useFiscalCalculations';

interface Props {
  state: AppState;
  fiscal: UseFiscalCalculationsReturn;
  totalExpensesMonthly: ComputedRef<number>;
  formatCurrency: (val: number) => string;
  barcodePattern: number[];
  socialSecurityEmployeeRate: number;
  socialSecurityEmployerRate: number;
}

type InfoSection = 'costeEmpresa' | 'ssEmpresa' | 'salarioBruto' | 'irpf' | 'ssTrabajador' | 'impuestosIndirectos';

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update-state', patch: Partial<AppState>): void;
  (e: 'show-info-tooltip', section: InfoSection, event: MouseEvent): void;
  (e: 'hide-info-tooltip'): void;
}>();

// Destructure fiscal for template convenience
const {
  annualGross,
  employerCostAnnual,
  employerSSAnnual,
  irpfRate,
  irpfAnnual,
  employeeSSAnnual,
  netAnnual,
  indirectTaxes,
  totalIndirectAnnual,
  stateShareAnnual,
  userShareAnnual,
  displayFactor,
  displayFactorExpenses,
} = props.fiscal;

// View mode helpers
const viewModes: ViewMode[] = ['Mensual', 'Anual'];

const isAnnual = computed(() => props.state.viewMode === 'Anual');

// Computed display values
const employerCostDisplay = computed(() =>
  employerCostAnnual.value * displayFactor.value
);

const employerSSDisplay = computed(() =>
  employerSSAnnual.value * displayFactor.value
);

const grossDisplay = computed(() =>
  annualGross.value * displayFactor.value
);

const irpfDisplay = computed(() =>
  irpfAnnual.value * displayFactor.value
);

const employeeSSDisplay = computed(() =>
  employeeSSAnnual.value * displayFactor.value
);

const netDisplay = computed(() =>
  netAnnual.value * displayFactor.value
);

const totalIndirectDisplay = computed(() =>
  totalIndirectAnnual.value * displayFactor.value
);

const stateShareDisplay = computed(() =>
  stateShareAnnual.value * displayFactor.value
);

const userShareDisplay = computed(() =>
  userShareAnnual.value * displayFactor.value
);

// Expense display values
const expensesDisplay = computed(() =>
  props.totalExpensesMonthly.value * displayFactorExpenses.value
);

// Percentage calculations
const statePercent = computed(() =>
  employerCostDisplay.value > 0
    ? (stateShareDisplay.value / employerCostDisplay.value) * 100
    : 0
);

const userPercent = computed(() =>
  employerCostDisplay.value > 0
    ? (userShareDisplay.value / employerCostDisplay.value) * 100
    : 0
);

// Info tooltip handler
const handleInfoClick = (section: InfoSection, event: MouseEvent) => {
  emit('show-info-tooltip', section, event);
};
</script>

<template>
  <div class="flex flex-col w-full lg:w-[420px] flex-shrink-0 sticky top-8 self-start">
    <!-- Ticket Container -->
    <div class="bg-ticket-bg rounded-xl shadow-lg overflow-hidden border border-stone-300 print:shadow-none">
      <!-- Header -->
      <div class="bg-stone-100 px-5 py-4 border-b border-stone-300">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center">
              <span class="material-symbols-outlined">receipt_long</span>
            </div>
            <div>
              <h2 class="text-sm font-bold text-stone-800 uppercase tracking-wide">Ticket Fiscal</h2>
              <p class="text-[10px] text-stone-500">Desglose de tu contribución al Estado</p>
            </div>
          </div>
          <!-- View Mode Toggle -->
          <div class="flex gap-1 bg-stone-200 p-1 rounded-lg">
            <button
              v-for="mode in viewModes"
              :key="mode"
              :class="[
                'px-3 py-1.5 text-xs font-semibold rounded-md transition-all',
                state.viewMode === mode
                  ? 'bg-white text-stone-800 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              ]"
              @click="emit('update-state', { viewMode: mode })"
            >
              {{ mode }}
            </button>
          </div>
        </div>
      </div>

      <!-- Ticket Body -->
      <div class="px-5 py-4 space-y-4 font-mono text-xs">
        <!-- Employer Cost Section -->
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-1.5">
              <span class="text-stone-500 uppercase tracking-wider text-[10px] font-bold">Coste Empresa</span>
              <button
                class="text-stone-400 hover:text-primary transition-colors"
                @click="handleInfoClick('costeEmpresa', $event)"
              >
                <span class="material-symbols-outlined text-sm">info</span>
              </button>
            </div>
            <span class="font-bold text-stone-800">{{ formatCurrency(employerCostDisplay) }}</span>
          </div>

          <!-- Employer SS -->
          <div class="pl-3 border-l-2 border-stone-200 space-y-1">
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-1.5">
                <span class="text-stone-500">S.S. Empresa ({{ (socialSecurityEmployerRate * 100).toFixed(2) }}%)</span>
                <button
                  class="text-stone-400 hover:text-primary transition-colors"
                  @click="handleInfoClick('ssEmpresa', $event)"
                >
                  <span class="material-symbols-outlined text-xs">info</span>
                </button>
              </div>
              <span class="text-red-600 font-semibold">-{{ formatCurrency(employerSSDisplay) }}</span>
            </div>
          </div>
        </div>

        <!-- Separator -->
        <div class="border-t border-dashed border-stone-300"></div>

        <!-- Gross Salary Section -->
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-stone-500 uppercase tracking-wider text-[10px] font-bold">Salario Bruto</span>
            <span class="font-bold text-stone-800">{{ formatCurrency(grossDisplay) }}</span>
          </div>

          <!-- Employee Deductions -->
          <div class="pl-3 border-l-2 border-stone-200 space-y-1">
            <!-- IRPF -->
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-1.5">
                <span class="text-stone-500">IRPF ({{ (irpfRate * 100).toFixed(2) }}%)</span>
                <button
                  class="text-stone-400 hover:text-primary transition-colors"
                  @click="handleInfoClick('irpf', $event)"
                >
                  <span class="material-symbols-outlined text-xs">info</span>
                </button>
              </div>
              <span class="text-red-600 font-semibold">-{{ formatCurrency(irpfDisplay) }}</span>
            </div>

            <!-- Employee SS -->
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-1.5">
                <span class="text-stone-500">S.S. Trabajador ({{ (socialSecurityEmployeeRate * 100).toFixed(2) }}%)</span>
                <button
                  class="text-stone-400 hover:text-primary transition-colors"
                  @click="handleInfoClick('ssTrabajador', $event)"
                >
                  <span class="material-symbols-outlined text-xs">info</span>
                </button>
              </div>
              <span class="text-red-600 font-semibold">-{{ formatCurrency(employeeSSDisplay) }}</span>
            </div>
          </div>
        </div>

        <!-- Separator -->
        <div class="border-t border-dashed border-stone-300"></div>

        <!-- Net Salary Section -->
        <div class="bg-emerald-50 -mx-5 px-5 py-3 border-y border-emerald-200">
          <div class="flex justify-between items-center">
            <span class="text-emerald-800 uppercase tracking-wider text-[10px] font-bold">Salario Neto</span>
            <span class="font-bold text-emerald-700 text-base">{{ formatCurrency(netDisplay) }}</span>
          </div>
        </div>

        <!-- Consumption Section -->
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-stone-500 uppercase tracking-wider text-[10px] font-bold">Tu Consumo</span>
            <span class="font-semibold text-stone-700">{{ formatCurrency(expensesDisplay) }}</span>
          </div>

          <!-- Indirect Taxes -->
          <div class="pl-3 border-l-2 border-stone-200 space-y-1">
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-1.5">
                <span class="text-stone-500">Impuestos Indirectos</span>
                <button
                  class="text-stone-400 hover:text-primary transition-colors"
                  @click="handleInfoClick('impuestosIndirectos', $event)"
                >
                  <span class="material-symbols-outlined text-xs">info</span>
                </button>
              </div>
              <span class="text-red-600 font-semibold">-{{ formatCurrency(totalIndirectDisplay) }}</span>
            </div>

            <!-- IVA Breakdown (if relevant values) -->
            <div v-if="indirectTaxes.iva21 > 0 || indirectTaxes.iva10 > 0 || indirectTaxes.iva4 > 0" class="pl-3 space-y-0.5 text-[10px] text-stone-400">
              <div v-if="indirectTaxes.iva21 * displayFactorExpenses > 0" class="flex justify-between">
                <span>IVA 21%</span>
                <span>{{ formatCurrency(indirectTaxes.iva21 * displayFactorExpenses) }}</span>
              </div>
              <div v-if="indirectTaxes.iva10 * displayFactorExpenses > 0" class="flex justify-between">
                <span>IVA 10%</span>
                <span>{{ formatCurrency(indirectTaxes.iva10 * displayFactorExpenses) }}</span>
              </div>
              <div v-if="indirectTaxes.iva4 * displayFactorExpenses > 0" class="flex justify-between">
                <span>IVA 4%</span>
                <span>{{ formatCurrency(indirectTaxes.iva4 * displayFactorExpenses) }}</span>
              </div>
            </div>

            <!-- Special Taxes Breakdown (if relevant values) -->
            <div v-if="indirectTaxes.ieh > 0 || indirectTaxes.iee > 0 || indirectTaxes.ips > 0 || indirectTaxes.directTaxes > 0" class="pl-3 space-y-0.5 text-[10px] text-stone-400">
              <div v-if="indirectTaxes.ieh * displayFactorExpenses > 0" class="flex justify-between">
                <span>Hidrocarburos</span>
                <span>{{ formatCurrency(indirectTaxes.ieh * displayFactorExpenses) }}</span>
              </div>
              <div v-if="indirectTaxes.iee * displayFactorExpenses > 0" class="flex justify-between">
                <span>Electricidad</span>
                <span>{{ formatCurrency(indirectTaxes.iee * displayFactorExpenses) }}</span>
              </div>
              <div v-if="indirectTaxes.ips * displayFactorExpenses > 0" class="flex justify-between">
                <span>Primas Seguros</span>
                <span>{{ formatCurrency(indirectTaxes.ips * displayFactorExpenses) }}</span>
              </div>
              <div v-if="indirectTaxes.specialOthers * displayFactorExpenses > 0" class="flex justify-between">
                <span>Otros Especiales</span>
                <span>{{ formatCurrency(indirectTaxes.specialOthers * displayFactorExpenses) }}</span>
              </div>
              <div v-if="indirectTaxes.directTaxes * displayFactorExpenses > 0" class="flex justify-between">
                <span>Tasas e Imp. Directos</span>
                <span>{{ formatCurrency(indirectTaxes.directTaxes * displayFactorExpenses) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Final Summary -->
        <div class="border-t-2 border-stone-400 pt-4 space-y-3">
          <!-- State Share -->
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded bg-red-100 flex items-center justify-center">
                <span class="material-symbols-outlined text-red-600 text-sm">account_balance</span>
              </div>
              <span class="text-stone-600 font-medium">Total al Estado</span>
            </div>
            <span class="font-bold text-red-600 text-lg">{{ formatCurrency(stateShareDisplay) }}</span>
          </div>

          <!-- User Share -->
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded bg-emerald-100 flex items-center justify-center">
                <span class="material-symbols-outlined text-emerald-600 text-sm">person</span>
              </div>
              <span class="text-stone-600 font-medium">Te queda a ti</span>
            </div>
            <span class="font-bold text-emerald-600 text-lg">{{ formatCurrency(userShareDisplay) }}</span>
          </div>

          <!-- Percentage Bar -->
          <div class="space-y-1.5">
            <div class="flex gap-0.5 h-4 rounded-full overflow-hidden">
              <div
                class="bg-red-500 transition-all duration-500"
                :style="{ width: `${statePercent}%` }"
              ></div>
              <div
                class="bg-emerald-500 transition-all duration-500"
                :style="{ width: `${userPercent}%` }"
              ></div>
            </div>
            <div class="flex justify-between text-[10px] font-bold">
              <span class="text-red-600">{{ statePercent.toFixed(1) }}% Estado</span>
              <span class="text-emerald-600">{{ userPercent.toFixed(1) }}% Tú</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Barcode Footer -->
      <div class="px-5 py-3 bg-stone-50 border-t border-stone-200">
        <div class="flex justify-center gap-px">
          <template v-for="(width, index) in barcodePattern" :key="index">
            <div
              class="bg-stone-800"
              :style="{ width: `${width}px`, height: '24px' }"
            ></div>
            <div
              v-if="index < barcodePattern.length - 1"
              class="bg-transparent"
              :style="{ width: `${(index % 2) + 1}px` }"
            ></div>
          </template>
        </div>
        <p class="text-center text-[9px] text-stone-400 mt-2 font-mono">
          {{ isAnnual ? 'ANUAL' : 'MENSUAL' }} · {{ new Date().toLocaleDateString('es-ES') }}
        </p>
      </div>
    </div>
  </div>
</template>
