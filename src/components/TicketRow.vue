<!--
  TicketRow - A single row in the fiscal ticket showing label and value.

  Why this exists:
  - Eliminates 20+ repetitions of the ticket row pattern in App.vue
  - Provides consistent formatting for monetary values
  - Supports different variants (normal, bold, breakdown, highlighted)

  Contract:
  - Props: label, value, variant?, negative?, showInfo?
  - Emits: info-click (if showInfo is true)

  Usage:
  <TicketRow
    label="SALARIO BRUTO"
    :value="grossSalary"
    variant="bold"
    @info-click="showInfoTooltip('salarioBruto', $event)"
  />
-->

<script setup lang="ts">
import { computed } from 'vue';
import { formatCurrency } from '@/utils/calculations';
import InfoButton from './InfoButton.vue';

type RowVariant = 'default' | 'bold' | 'breakdown' | 'highlight' | 'total';

interface Props {
  /** Text label for the row */
  label: string;
  /** Numeric value to display (will be formatted as currency) */
  value: number;
  /** Visual variant affecting styling */
  variant?: RowVariant;
  /** Whether to show value with minus sign (for deductions) */
  negative?: boolean;
  /** Whether to show info button */
  showInfo?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  negative: false,
  showInfo: false,
});

const emit = defineEmits<{
  'info-click': [event: MouseEvent];
}>();

/**
 * Formats the value with optional negative sign.
 */
const formattedValue = computed(() => {
  const formatted = formatCurrency(Math.abs(props.value));
  return props.negative ? `- ${formatted}` : formatted;
});

/**
 * Container classes based on variant.
 */
const containerClass = computed(() => {
  const base = 'flex justify-between items-baseline';

  switch (props.variant) {
    case 'bold':
      return `${base} text-sm font-black text-stone-900 dark:text-white uppercase`;
    case 'breakdown':
      return `${base} text-xs text-stone-500 dark:text-stone-400 pl-4`;
    case 'highlight':
      return `${base} text-sm font-bold text-red-600 dark:text-red-400`;
    case 'total':
      return `${base} text-base font-black text-stone-900 dark:text-white uppercase pt-2 border-t border-dashed border-stone-300 dark:border-stone-600`;
    default:
      return `${base} text-sm text-stone-700 dark:text-stone-300`;
  }
});

/**
 * Value classes based on variant.
 */
const valueClass = computed(() => {
  const base = 'font-mono';

  switch (props.variant) {
    case 'highlight':
      return `${base} text-red-600 dark:text-red-400`;
    case 'breakdown':
      return `${base} text-stone-500 dark:text-stone-400`;
    default:
      return base;
  }
});

const handleInfoClick = (event: MouseEvent): void => {
  emit('info-click', event);
};
</script>

<template>
  <div :class="containerClass">
    <div class="flex items-center gap-1.5">
      <span>{{ label }}</span>
      <InfoButton
        v-if="showInfo"
        @click="handleInfoClick"
      />
    </div>
    <span :class="valueClass">{{ formattedValue }}</span>
  </div>
</template>
