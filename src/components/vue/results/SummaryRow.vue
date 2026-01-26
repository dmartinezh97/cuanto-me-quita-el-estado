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
import ExplanationBox from '../ui/ExplanationBox.vue';
import { LEARN_CONTENT } from '@/constants/learn-content';

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
  /** Whether learn mode is active */
  learnModeActive?: boolean;
}

const props = defineProps<Props>();
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex flex-col lg:flex-row gap-6 w-full">
      <!-- Two stacked hero cards -->
      <div class="flex flex-col gap-4 lg:gap-6 flex-1">
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
        class="w-full lg:w-auto"
        :state-percent="statePercent"
        :total-taxes="totalTaxes"
        :format-currency="formatCurrency"
      />
    </div>

    <!-- Learn Mode Explanation -->
    <Transition name="explanation">
      <ExplanationBox
        v-if="learnModeActive"
        variant="gray"
        :title="LEARN_CONTENT.presionFiscal.title"
        :content="LEARN_CONTENT.presionFiscal.content"
        :details="LEARN_CONTENT.presionFiscal.details"
      />
    </Transition>
  </div>
</template>
