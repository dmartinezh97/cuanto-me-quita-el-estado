<script setup lang="ts">
/**
 * SSBreakdownCard.vue - Social Security breakdown card.
 *
 * Two variants:
 * - employer (teal): SS contributions by employer
 * - employee (purple): SS contributions by employee
 */

import DataRow from '../ui/DataRow.vue';
import type { SSBreakdownItem } from '@/types';

interface Props {
  /** Card title (e.g., "S.S. Empresa") */
  title: string;
  /** Total SS contribution */
  total: number;
  /** Visual variant - employer (teal) or employee (purple) */
  variant: 'employer' | 'employee';
  /** Breakdown items */
  items: SSBreakdownItem[];
  /** Currency formatter function */
  formatCurrency: (val: number) => string;
}

const props = defineProps<Props>();

const headerBgClass = props.variant === 'employer'
  ? 'bg-primary'
  : 'bg-purple';
</script>

<template>
  <div class="flex flex-col rounded-xl bg-surface border border-border overflow-hidden">
    <!-- Header -->
    <div
      class="flex items-center justify-between px-5 py-4"
      :class="headerBgClass"
    >
      <span class="text-sm font-semibold text-white">
        {{ title }}
      </span>
      <span class="text-lg font-bold text-white">
        {{ formatCurrency(total) }}
      </span>
    </div>

    <!-- Breakdown Items -->
    <div class="flex flex-col gap-1 p-4">
      <DataRow
        v-for="item in items"
        :key="item.label"
        :label="item.label"
        :rate="item.rate"
        :value="item.value"
        :format-currency="formatCurrency"
        :muted="true"
      />
    </div>
  </div>
</template>
