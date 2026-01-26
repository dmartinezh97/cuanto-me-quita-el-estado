<script setup lang="ts">
/**
 * TramoBar.vue - IRPF bracket visualization bar.
 *
 * Shows a tax bracket with range, rate, visual bar, and amount.
 * Disabled state for brackets that don't apply to current income.
 */

interface Props {
  /** Range label (e.g., "0 - 12.450 €") */
  rangeLabel: string;
  /** Tax rate percentage */
  rate: number;
  /** Tax amount for this bracket */
  amount: number;
  /** Percentage of bracket filled (0-100) */
  fillPercent: number;
  /** Whether this bracket applies to current income */
  isActive: boolean;
  /** Currency formatter function */
  formatCurrency: (val: number) => string;
  /** Bracket index for gradient coloring (0-based) */
  index?: number;
}

const props = withDefaults(defineProps<Props>(), {
  index: 0,
});

// Gradient colors from dark to light orange
const BRACKET_COLORS = [
  '#E07A3D', // Tramo 1 - naranja oscuro
  '#E8935A', // Tramo 2 - naranja medio
  '#F0AC7E', // Tramo 3 - naranja claro
  '#F5C4A1', // Tramo 4 - naranja más claro
  '#FADCC4', // Tramo 5 - naranja muy claro
];

const barColor = BRACKET_COLORS[props.index] || BRACKET_COLORS[0];
</script>

<template>
  <div class="flex items-center gap-3">
    <!-- Range and rate info -->
    <div class="flex flex-col gap-0.5 w-[140px] flex-shrink-0">
      <span
        class="text-[13px] font-medium"
        :class="isActive ? 'text-text-primary' : 'text-text-secondary'"
      >
        {{ rangeLabel }}
      </span>
      <span
        class="font-mono text-[11px]"
        :class="isActive ? 'text-text-muted' : 'text-text-disabled'"
      >
        {{ rate }}%
      </span>
    </div>

    <!-- Bar visualization -->
    <div
      class="flex-1 h-6 rounded bg-border-light relative overflow-hidden"
      :class="{ 'flex items-center justify-center': !isActive }"
    >
      <template v-if="isActive">
        <div
          class="absolute left-0 top-0 h-full transition-all duration-500"
          :class="{ 'rounded-r': fillPercent < 100 }"
          :style="{ width: `${fillPercent}%`, backgroundColor: barColor }"
        />
      </template>
      <template v-else>
        <span class="text-text-disabled text-[11px]">No aplica</span>
      </template>
    </div>

    <!-- Amount -->
    <span
      class="text-[13px] font-semibold text-right w-[80px] flex-shrink-0"
      :class="isActive ? 'text-text-primary' : 'text-text-disabled'"
    >
      {{ formatCurrency(amount) }}
    </span>
  </div>
</template>
