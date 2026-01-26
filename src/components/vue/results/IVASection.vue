<script setup lang="ts">
/**
 * IVASection.vue - Indirect taxes (IVA) section.
 *
 * Shows a header with totals and a grid of category cards
 * showing IVA for each spending category.
 */

import { computed } from 'vue';
import { ShoppingBag } from 'lucide-vue-next';
import IVACategoryCard from '../cards/IVACategoryCard.vue';
import type { CategoryExpense, IVABreakdown } from '@/types';

interface Props {
  /** Total indirect taxes (monthly) */
  totalIndirectMonthly: number;
  /** Total indirect taxes (annual) */
  totalIndirectAnnual: number;
  /** Expense categories */
  expenses: CategoryExpense[];
  /** IVA breakdown */
  ivaBreakdown: IVABreakdown;
  /** Currency formatter */
  formatCurrency: (val: number) => string;
}

const props = defineProps<Props>();

// Map category IDs to icons
const categoryIcons: Record<string, string> = {
  transport: 'car',
  home: 'home',
  food: 'shopping-cart',
  leisure: 'utensils',
  shopping: 'shirt',
  health: 'heart-pulse',
};

// Calculate IVA per category
const categoryIVA = computed(() => {
  return props.expenses.map(cat => {
    // Calculate total IVA for this category
    let totalIVA = 0;
    let dominantRate = 21;

    if (cat.subItems && cat.subItems.length > 0) {
      // Sum IVA from all sub-items
      for (const sub of cat.subItems) {
        if (sub.amount > 0 && sub.ivaRate > 0) {
          // IVA = amount - (amount / (1 + rate))
          const baseAmount = sub.amount / (1 + sub.ivaRate / 100);
          totalIVA += sub.amount - baseAmount;
        }
      }
      // Find dominant rate (most common among sub-items with amounts)
      const rates = cat.subItems
        .filter(s => s.amount > 0)
        .map(s => s.ivaRate);
      if (rates.length > 0) {
        dominantRate = Math.max(...rates);
      }
    } else if (cat.total > 0) {
      // Use category's IVA distribution
      const base4 = (cat.total * (cat.iva4 / 100)) / 1.04;
      const base10 = (cat.total * (cat.iva10 / 100)) / 1.10;
      const base21 = (cat.total * (cat.iva21 / 100)) / 1.21;

      totalIVA = (cat.total * cat.iva4 / 100 - base4) +
                 (cat.total * cat.iva10 / 100 - base10) +
                 (cat.total * cat.iva21 / 100 - base21);

      // Dominant rate is the one with highest percentage
      if (cat.iva4 >= cat.iva10 && cat.iva4 >= cat.iva21) dominantRate = 4;
      else if (cat.iva10 >= cat.iva21) dominantRate = 10;
    }

    return {
      id: cat.id,
      name: cat.name,
      icon: categoryIcons[cat.id] || 'shopping-cart',
      ivaAmount: totalIVA,
      dominantRate,
    };
  }).filter(c => c.ivaAmount > 0);
});
</script>

<template>
  <div class="flex flex-col gap-5 rounded-xl bg-surface border border-border p-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-warning-light flex items-center justify-center">
          <ShoppingBag class="w-5 h-5 text-warning" />
        </div>
        <div class="flex flex-col">
          <span class="text-base font-semibold text-text-primary">Impuestos Indirectos</span>
          <span class="text-xs text-text-muted">IVA y especiales</span>
        </div>
      </div>
      <div class="flex flex-col items-end">
        <span class="text-lg font-bold text-warning">
          {{ formatCurrency(totalIndirectMonthly) }}/mes
        </span>
        <span class="text-xs text-text-muted">
          {{ formatCurrency(totalIndirectAnnual) }}/ano
        </span>
      </div>
    </div>

    <!-- Category grid -->
    <div class="grid grid-cols-3 gap-3">
      <IVACategoryCard
        v-for="cat in categoryIVA"
        :key="cat.id"
        :icon="cat.icon"
        :name="cat.name"
        :amount="cat.ivaAmount"
        :rate="cat.dominantRate"
        :format-currency="formatCurrency"
      />
    </div>

    <!-- Empty state if no expenses -->
    <div
      v-if="categoryIVA.length === 0"
      class="text-center py-8 text-text-muted text-sm"
    >
      Introduce tus gastos mensuales para ver el desglose de IVA
    </div>
  </div>
</template>
