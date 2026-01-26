<script setup lang="ts">
/**
 * SSBreakdownCard.vue - Social Security breakdown card.
 *
 * Two variants:
 * - employer (teal): SS contributions by employer
 * - employee (purple): SS contributions by employee
 */

import { Building2, User } from 'lucide-vue-next';
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

// Color configuration per variant
const variantConfig = {
  employer: {
    iconBg: '#E8F5F5',
    iconColor: '#0D6E6E',
    totalColor: '#0D6E6E',
  },
  employee: {
    iconBg: '#EEF2FF',
    iconColor: '#5B6AD0',
    totalColor: '#5B6AD0',
  },
};

const config = variantConfig[props.variant];
</script>

<template>
  <div class="flex flex-col rounded-xl bg-white border border-[#E5E5E5] overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between px-5 py-4">
      <div class="flex items-center gap-3">
        <!-- Icon with colored background -->
        <div
          class="w-8 h-8 rounded-lg flex items-center justify-center"
          :style="{ backgroundColor: config.iconBg }"
        >
          <component
            :is="variant === 'employer' ? Building2 : User"
            class="w-4 h-4"
            :style="{ color: config.iconColor }"
          />
        </div>
        <!-- Title -->
        <span class="text-sm font-semibold text-[#1A1A1A]">
          {{ title }}
        </span>
      </div>
      <!-- Total -->
      <span
        class="text-lg font-bold"
        :style="{ color: config.totalColor }"
      >
        {{ formatCurrency(total) }}
      </span>
    </div>

    <!-- Breakdown Items -->
    <div class="flex flex-col gap-1 px-5 pb-4">
      <div
        v-for="item in items"
        :key="item.label"
        class="flex items-center justify-between"
      >
        <span class="text-[13px] text-[#666666]">
          {{ item.label }} <span class="text-[#999999]">({{ item.rate }})</span>
        </span>
        <span class="text-[13px] text-[#1A1A1A] font-medium">{{ formatCurrency(item.value) }}</span>
      </div>
    </div>
  </div>
</template>
