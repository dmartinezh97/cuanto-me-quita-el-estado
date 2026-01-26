<script setup lang="ts">
/**
 * SummaryRow.vue - Top row with main metric cards.
 *
 * Displays:
 * - Coste Total Empresa (HeroCard primary)
 * - Tu Salario Neto (HeroCard dark)
 * - Presion Fiscal (PresionFiscalCard with donut)
 */

import HeroCard from '../cards/HeroCard.vue';
import PresionFiscalCard from '../cards/PresionFiscalCard.vue';

interface Props {
  /** Total employer cost */
  employerCost: number;
  /** Net salary */
  netSalary: number;
  /** Percentage going to state */
  statePercent: number;
  /** Total taxes */
  totalTaxes: number;
  /** Currency formatter */
  formatCurrency: (val: number) => string;
}

defineProps<Props>();
</script>

<template>
  <div class="flex gap-6 w-full">
    <!-- Two stacked hero cards -->
    <div class="flex flex-col gap-6 flex-1">
      <HeroCard
        label="COSTE TOTAL EMPRESA"
        :value="employerCost"
        description="Lo que realmente cuesta contratarte"
        variant="primary"
        :format-currency="formatCurrency"
      />
      <HeroCard
        label="TU SALARIO NETO"
        :value="netSalary"
        description="Lo que realmente recibes"
        variant="dark"
        :format-currency="formatCurrency"
      />
    </div>

    <!-- Presion fiscal card -->
    <PresionFiscalCard
      :state-percent="statePercent"
      :total-taxes="totalTaxes"
      :format-currency="formatCurrency"
    />
  </div>
</template>
