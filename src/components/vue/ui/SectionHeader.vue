<script setup lang="ts">
/**
 * SectionHeader.vue - Header for result sections.
 *
 * Shows an icon, title, optional subtitle, and values on the right.
 */

import {
  Receipt,
  Percent,
  Building2,
  User,
  ShoppingBag,
} from 'lucide-vue-next';
import { computed } from 'vue';

interface Props {
  /** Lucide icon name */
  icon: string;
  /** Section title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Total value to display on right */
  totalValue?: number;
  /** Secondary value (e.g., effective rate) */
  secondaryValue?: string;
  /** Icon color variant */
  iconVariant?: 'accent' | 'warning' | 'primary' | 'purple';
  /** Currency formatter function */
  formatCurrency?: (val: number) => string;
}

const props = withDefaults(defineProps<Props>(), {
  iconVariant: 'accent',
});

// Icon component mapping
const iconComponents: Record<string, typeof Receipt> = {
  receipt: Receipt,
  percent: Percent,
  building: Building2,
  user: User,
  'shopping-bag': ShoppingBag,
};

const IconComponent = computed(() => iconComponents[props.icon] || Receipt);

const iconColorClass = computed(() => {
  const colors: Record<string, string> = {
    accent: 'text-accent',
    warning: 'text-warning',
    primary: 'text-primary',
    purple: 'text-purple',
  };
  return colors[props.iconVariant] || 'text-accent';
});

const iconBgClass = computed(() => {
  const bgs: Record<string, string> = {
    accent: 'bg-accent-light',
    warning: 'bg-warning-light',
    primary: 'bg-primary-light',
    purple: 'bg-purple-light',
  };
  return bgs[props.iconVariant] || 'bg-accent-light';
});
</script>

<template>
  <div class="flex items-center justify-between w-full">
    <!-- Left side: Icon + Title -->
    <div class="flex items-center gap-3">
      <div
        class="w-10 h-10 rounded-lg flex items-center justify-center"
        :class="iconBgClass"
      >
        <component
          :is="IconComponent"
          class="w-5 h-5"
          :class="iconColorClass"
        />
      </div>
      <div class="flex flex-col">
        <span class="text-base font-semibold text-text-primary">
          {{ title }}
        </span>
        <span v-if="subtitle" class="text-xs text-text-muted">
          {{ subtitle }}
        </span>
      </div>
    </div>

    <!-- Right side: Values -->
    <div v-if="totalValue !== undefined || secondaryValue" class="flex flex-col items-end">
      <span
        v-if="totalValue !== undefined && formatCurrency"
        class="text-lg font-bold"
        :class="iconColorClass"
      >
        {{ formatCurrency(totalValue) }}
      </span>
      <span v-if="secondaryValue" class="text-xs text-text-muted">
        {{ secondaryValue }}
      </span>
    </div>
  </div>
</template>
