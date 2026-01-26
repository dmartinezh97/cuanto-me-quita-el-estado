<script setup lang="ts">
/**
 * HeroCard.vue - Large hero card for main metrics.
 *
 * Two variants:
 * - primary (teal): Used for "Coste Total Empresa"
 * - dark (black): Used for "Tu Salario Neto"
 */

interface Props {
  /** Label text (e.g., "COSTE TOTAL EMPRESA") */
  label: string;
  /** Monetary value to display */
  value: number;
  /** Description text below the value */
  description: string;
  /** Visual variant - primary (teal) or dark (black) */
  variant: 'primary' | 'dark';
  /** Currency formatter function */
  formatCurrency: (val: number) => string;
}

const props = defineProps<Props>();

const bgClass = props.variant === 'primary' ? 'bg-primary' : 'bg-text-primary';
</script>

<template>
  <div
    class="flex flex-col gap-2 rounded-xl p-6"
    :class="bgClass"
  >
    <!-- Label -->
    <span class="font-mono text-[10px] font-semibold tracking-wider text-white/70">
      {{ label }}
    </span>

    <!-- Value -->
    <span class="text-4xl font-bold text-white">
      {{ formatCurrency(value) }}
    </span>

    <!-- Description -->
    <span class="text-[13px] text-white/80">
      {{ description }}
    </span>
  </div>
</template>
