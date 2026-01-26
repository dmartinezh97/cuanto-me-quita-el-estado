<script setup lang="ts">
/**
 * InitialStateView.vue - Empty state for the right panel.
 *
 * Shows an illustration with floating icons, title, description,
 * step indicators (1-2-3), and an arrow hint.
 */

import { Receipt, Percent, PiggyBank, ArrowLeft } from 'lucide-vue-next';

interface Step {
  number: number;
  label: string;
  active: boolean;
}

const steps: Step[] = [
  { number: 1, label: 'Introduce datos', active: true },
  { number: 2, label: 'Calcula', active: false },
  { number: 3, label: 'Visualiza resultados', active: false },
];
</script>

<template>
  <div class="flex flex-col items-center gap-8 w-full max-w-[480px]">
    <!-- Illustration with floating icons -->
    <div class="relative w-[280px] h-[200px]">
      <!-- Background circle -->
      <div
        class="absolute w-[200px] h-[200px] rounded-full bg-primary-light"
        style="left: 40px; top: 0;"
      ></div>

      <!-- Floating icon 1 - Receipt (teal) -->
      <div
        class="absolute flex items-center justify-center w-20 h-20 bg-surface rounded-xl border border-border shadow-lg"
        style="left: 20px; top: 60px;"
      >
        <Receipt class="w-8 h-8 text-primary" />
      </div>

      <!-- Floating icon 2 - Percent (orange) -->
      <div
        class="absolute flex items-center justify-center w-20 h-20 bg-surface rounded-xl border border-border shadow-lg"
        style="left: 100px; top: 20px;"
      >
        <Percent class="w-8 h-8 text-accent" />
      </div>

      <!-- Floating icon 3 - PiggyBank (yellow) -->
      <div
        class="absolute flex items-center justify-center w-20 h-20 bg-surface rounded-xl border border-border shadow-lg"
        style="left: 180px; top: 60px;"
      >
        <PiggyBank class="w-8 h-8 text-warning" />
      </div>
    </div>

    <!-- Text content -->
    <div class="flex flex-col items-center gap-4 w-full">
      <h2 class="font-display text-[28px] font-medium text-text-primary text-center">
        Descubre tu carga fiscal real
      </h2>
      <p class="text-[15px] leading-relaxed text-text-secondary text-center max-w-[400px]">
        Introduce tu salario y situación personal para calcular cuánto te quita
        realmente el Estado de cada euro que generas.
      </p>
    </div>

    <!-- Steps indicator -->
    <div class="flex items-center justify-center gap-8 w-full">
      <div
        v-for="step in steps"
        :key="step.number"
        class="flex flex-col items-center gap-2 w-[120px]"
      >
        <div
          class="step-indicator"
          :class="step.active ? 'step-indicator--active' : 'step-indicator--inactive'"
        >
          {{ step.number }}
        </div>
        <span
          class="text-[13px] text-center"
          :class="step.active ? 'text-text-secondary' : 'text-text-muted'"
        >
          {{ step.label }}
        </span>
      </div>
    </div>

    <!-- Arrow hint -->
    <div class="flex items-center gap-3">
      <ArrowLeft class="w-5 h-5 text-primary" />
      <span class="text-[14px] font-medium text-primary">
        Empieza introduciendo tu salario bruto anual
      </span>
    </div>
  </div>
</template>
