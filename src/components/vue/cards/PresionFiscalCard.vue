<script setup lang="ts">
/**
 * PresionFiscalCard.vue - Card showing fiscal pressure with donut chart.
 *
 * Displays the percentage of income going to taxes with a visual
 * donut chart, legend, and total amount.
 */

import DonutChart from '../ui/DonutChart.vue';

interface Props {
  /** Percentage going to state (0-100) */
  statePercent: number;
  /** Total taxes amount (annual) */
  totalTaxes: number;
  /** Currency formatter function */
  formatCurrency: (val: number) => string;
}

const props = defineProps<Props>();
</script>

<template>
  <div class="flex flex-col items-center gap-4 rounded-xl bg-surface border border-border p-6 w-full lg:w-[280px]">
    <!-- Title -->
    <span class="font-mono text-[10px] font-semibold tracking-wider text-text-muted">
      PRESION FISCAL REAL
    </span>

    <!-- Donut Chart -->
    <DonutChart
      :percentage="statePercent"
      :size="140"
      fill-color="var(--color-primary)"
      bg-color="var(--color-primary-light)"
      label="impuestos"
    />

    <!-- Legend -->
    <div class="flex items-center justify-center gap-4 w-full">
      <div class="flex items-center gap-1.5">
        <div class="w-2.5 h-2.5 rounded-full bg-primary" />
        <span class="text-xs text-text-secondary">Estado</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-2.5 h-2.5 rounded-full bg-primary-light" />
        <span class="text-xs text-text-secondary">Tu</span>
      </div>
    </div>

    <!-- Total Amount -->
    <div class="flex flex-col items-center gap-1 w-full">
      <span class="text-lg font-semibold text-text-primary">
        {{ formatCurrency(totalTaxes) }}/año
      </span>
      <span class="text-xs text-text-muted">
        en impuestos totales
      </span>
    </div>
  </div>
</template>
