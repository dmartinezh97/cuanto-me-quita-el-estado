<script setup lang="ts">
/**
 * DataRow.vue - Simple label + value row for breakdowns.
 *
 * Used in SS breakdown cards and other detail lists.
 */

interface Props {
  /** Label text */
  label: string;
  /** Value to display */
  value: number;
  /** Optional rate string (e.g., "23,60%") */
  rate?: string;
  /** Currency formatter function */
  formatCurrency: (val: number) => string;
  /** Whether to use muted styling */
  muted?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  muted: false,
});
</script>

<template>
  <div
    class="flex items-center justify-between py-2 px-3 rounded"
    :class="muted ? 'bg-surface-secondary' : 'bg-surface'"
  >
    <div class="flex items-center gap-2">
      <span class="text-[12px] text-text-secondary">
        {{ label }}
      </span>
      <span v-if="rate" class="text-[10px] text-text-muted font-mono">
        ({{ rate }})
      </span>
    </div>
    <span class="text-[12px] font-medium text-text-primary font-mono">
      {{ formatCurrency(value) }}
    </span>
  </div>
</template>
