<script setup lang="ts">
/**
 * ResultsPanel.vue - Main container for all result visualizations.
 *
 * Orchestrates the display of:
 * - Summary row (employer cost, net salary, fiscal pressure)
 * - IRPF breakdown with bracket bars
 * - Social Security breakdown (employer + employee)
 * - IVA by category
 * - Final summary bar
 */

import { computed } from 'vue';
import type { AppState, CategoryExpense } from '@/types';
import type { UseFiscalCalculationsReturn } from '@/composables/useFiscalCalculations';

import SummaryRow from './SummaryRow.vue';
import IRPFSection from './IRPFSection.vue';
import SSSection from './SSSection.vue';
import IVASection from './IVASection.vue';
import ResumenFinal from './ResumenFinal.vue';

interface Props {
  /** Application state */
  state: AppState;
  /** Fiscal calculations from composable */
  fiscal: UseFiscalCalculationsReturn;
  /** Expense categories */
  expenses: CategoryExpense[];
  /** Currency formatter */
  formatCurrency: (val: number) => string;
}

const props = defineProps<Props>();

// Destructure fiscal values
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
} = props.fiscal;

// State percentage
const statePercent = computed(() => {
  if (employerCostAnnual.value <= 0) return 0;
  return (stateShareAnnual.value / employerCostAnnual.value) * 100;
});

// Monthly net calculations
const netMonthly12 = computed(() => netAnnual.value / 12);
const netMonthly14 = computed(() => netAnnual.value / 14);

// Monthly indirect taxes
const totalIndirectMonthly = computed(() => totalIndirectAnnual.value / 12);
</script>

<template>
  <div class="flex flex-col gap-10 w-full max-w-5xl">
    <!-- Summary Row -->
    <SummaryRow
      :employer-cost="employerCostAnnual"
      :net-salary="netAnnual"
      :state-percent="statePercent"
      :total-taxes="stateShareAnnual"
      :format-currency="formatCurrency"
    />

    <!-- IRPF Section -->
    <IRPFSection
      :irpf-total="irpfAnnual"
      :irpf-rate="irpfRate"
      :gross-salary="annualGross"
      :format-currency="formatCurrency"
    />

    <!-- SS Section -->
    <SSSection
      :employer-breakdown="employerSSBreakdown"
      :employee-breakdown="employeeSSBreakdown"
      :employer-total="employerSSAnnual"
      :employee-total="employeeSSAnnual"
      :format-currency="formatCurrency"
    />

    <!-- IVA Section -->
    <IVASection
      :total-indirect-monthly="totalIndirectMonthly"
      :total-indirect-annual="totalIndirectAnnual"
      :expenses="expenses"
      :iva-breakdown="indirectTaxes"
      :format-currency="formatCurrency"
    />

    <!-- Resumen Final -->
    <ResumenFinal
      :state-share-annual="stateShareAnnual"
      :net-monthly12="netMonthly12"
      :net-monthly14="netMonthly14"
      :format-currency="formatCurrency"
    />
  </div>
</template>
