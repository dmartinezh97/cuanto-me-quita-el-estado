<script setup lang="ts">
/**
 * IVACategoryCard.vue - Card showing IVA for a spending category.
 *
 * Displays category icon, name, tax amount, and rate badge.
 */

import {
  Car,
  Home,
  ShoppingCart,
  Utensils,
  Shirt,
  HeartPulse,
  type LucideIcon,
} from 'lucide-vue-next';
import { computed } from 'vue';
import Badge from '../ui/Badge.vue';

interface Props {
  /** Lucide icon name */
  icon: string;
  /** Category name */
  name: string;
  /** Tax amount */
  amount: number;
  /** IVA rate (4, 10, or 21) */
  rate: number;
  /** Currency formatter function */
  formatCurrency: (val: number) => string;
}

const props = defineProps<Props>();

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  car: Car,
  home: Home,
  'shopping-cart': ShoppingCart,
  utensils: Utensils,
  shirt: Shirt,
  'heart-pulse': HeartPulse,
};

const IconComponent = computed(() => iconMap[props.icon] || ShoppingCart);

// Badge variant based on rate
const badgeVariant = computed(() => {
  if (props.rate <= 4) return 'success';
  if (props.rate <= 10) return 'primary';
  return 'warning';
});
</script>

<template>
  <div class="flex flex-col items-center gap-3 rounded-lg bg-surface-secondary p-4 min-w-[140px]">
    <!-- Icon -->
    <component
      :is="IconComponent"
      class="w-6 h-6 text-text-secondary"
    />

    <!-- Category name -->
    <span class="text-xs text-text-secondary">
      {{ name }}
    </span>

    <!-- Amount -->
    <span class="text-base font-semibold text-text-primary">
      {{ formatCurrency(amount) }}
    </span>

    <!-- Rate badge -->
    <Badge
      :text="`${rate}%`"
      :variant="badgeVariant"
    />
  </div>
</template>
