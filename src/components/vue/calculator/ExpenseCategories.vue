<script setup lang="ts">
/**
 * ExpenseCategories.vue - Expense categories with collapsible rows.
 *
 * Styled according to Diseño.pen with:
 * - Collapsed category rows with Lucide icons
 * - Expandable details for each category
 * - Clean, minimal design
 */

import { ref, computed, type Component } from 'vue';
import {
  Car,
  Home,
  ShoppingCart,
  Utensils,
  ShoppingBag,
  HeartPulse,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
} from 'lucide-vue-next';
import type { CategoryExpense, SubItem } from '@/types';
import type { IVAKey } from '@/composables/useExpenses';

interface Props {
  expenses: CategoryExpense[];
  ivaDistribution: Array<{ key: IVAKey; label: string; color: string }>;
  formatCurrency: (val: number) => string;
  getLabelColorClass: (sub: SubItem) => string;
  getTaxLabel: (sub: SubItem) => string;
  isDualInput: (sub: SubItem) => boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'handle-sub-amount-input', catId: string, subId: string, event: Event): void;
  (e: 'handle-sub-price-input', catId: string, subId: string, event: Event): void;
  (e: 'handle-category-total-input', catId: string, event: Event): void;
  (e: 'handle-iva-slider', catId: string, type: IVAKey, event: Event): void;
  (e: 'show-salary-tooltip', event: FocusEvent): void;
  (e: 'hide-salary-tooltip'): void;
}>();

// Track which categories are expanded
const expandedCategories = ref<Set<string>>(new Set());

const toggleCategory = (catId: string) => {
  if (expandedCategories.value.has(catId)) {
    expandedCategories.value.delete(catId);
  } else {
    expandedCategories.value.add(catId);
  }
};

const isExpanded = (catId: string) => expandedCategories.value.has(catId);

// Map category IDs to Lucide icons
const categoryIcons: Record<string, Component> = {
  transport: Car,
  home: Home,
  food: ShoppingCart,
  leisure: Utensils,
  shopping: ShoppingBag,
  health: HeartPulse,
  services: MoreHorizontal,
};

const getIcon = (catId: string): Component => {
  return categoryIcons[catId] || ShoppingCart;
};
</script>

<template>
  <div class="flex flex-col gap-3">
    <label class="section-label">Gastos mensuales</label>

    <div class="flex flex-col gap-2">
      <div
        v-for="cat in expenses"
        :key="cat.id"
        class="overflow-hidden"
      >
        <!-- Category Row (Collapsed) -->
        <button
          @click="toggleCategory(cat.id)"
          class="category-row w-full"
          :class="{ 'border-primary bg-primary-light': isExpanded(cat.id) }"
        >
          <div class="flex items-center gap-3">
            <component
              :is="getIcon(cat.id)"
              class="w-5 h-5 text-text-muted"
            />
            <span class="text-[14px] text-text-primary">{{ cat.name }}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="font-mono text-[13px] text-text-muted">
              {{ formatCurrency(cat.total) }}
            </span>
            <component
              :is="isExpanded(cat.id) ? ChevronDown : ChevronRight"
              class="w-4 h-4 text-text-muted"
            />
          </div>
        </button>

        <!-- Expanded Content -->
        <div
          v-if="isExpanded(cat.id)"
          class="bg-surface border border-t-0 border-border rounded-b-lg p-4 flex flex-col gap-4"
        >
          <!-- Sub-items -->
          <div v-if="cat.subItems && cat.subItems.length" class="flex flex-col gap-3">
            <div
              v-for="sub in cat.subItems"
              :key="sub.id"
              class="flex flex-col gap-2 p-3 bg-surface-secondary rounded-lg"
            >
              <!-- Sub-item header with tax info -->
              <div class="flex justify-between items-start">
                <label class="text-[12px] font-medium text-text-secondary">{{ sub.name }}</label>
                <span class="text-[10px] text-right">
                  <span :class="getLabelColorClass(sub)">
                    {{ getTaxLabel(sub) }}
                  </span>
                  <template v-if="sub.display?.taxNote">
                    <br />
                    <span class="font-normal italic text-text-muted">
                      {{ sub.display.taxNote }}
                    </span>
                  </template>
                </span>
              </div>

              <!-- Dual-input mode (e.g., fuel) -->
              <div v-if="isDualInput(sub)" class="grid grid-cols-2 gap-3">
                <div class="flex flex-col gap-1">
                  <label class="text-[10px] text-text-muted">Importe Total</label>
                  <div class="relative">
                    <input
                      type="number"
                      min="0"
                      class="input-base w-full text-[13px] pr-8"
                      :value="sub.amount"
                      @input="emit('handle-sub-amount-input', cat.id, sub.id, $event)"
                      @focus="emit('show-salary-tooltip', $event)"
                      @blur="emit('hide-salary-tooltip')"
                    />
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-[12px]">€</span>
                  </div>
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[10px] text-text-muted">
                    {{ sub.display?.secondInputLabel ?? 'Precio unitario' }}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    class="input-base w-full text-[13px]"
                    :value="sub.pricePerUnit ?? ''"
                    @input="emit('handle-sub-price-input', cat.id, sub.id, $event)"
                  />
                </div>
              </div>

              <!-- Standard single input -->
              <div v-else class="relative">
                <input
                  type="number"
                  min="0"
                  class="input-base w-full text-[13px] pr-8"
                  :value="sub.amount"
                  @input="emit('handle-sub-amount-input', cat.id, sub.id, $event)"
                  @focus="emit('show-salary-tooltip', $event)"
                  @blur="emit('hide-salary-tooltip')"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-[12px]">€</span>
              </div>
            </div>
          </div>

          <!-- Category with IVA sliders (no sub-items) -->
          <template v-else>
            <div class="flex flex-col gap-2">
              <label class="text-[12px] font-medium text-text-secondary">Gasto mensual total</label>
              <div class="relative">
                <input
                  type="number"
                  min="0"
                  class="input-base w-full text-[13px] pr-8"
                  :value="cat.total"
                  @input="emit('handle-category-total-input', cat.id, $event)"
                  @focus="emit('show-salary-tooltip', $event)"
                  @blur="emit('hide-salary-tooltip')"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-[12px]">€</span>
              </div>
            </div>

            <!-- IVA Distribution Sliders -->
            <div class="flex flex-col gap-3 p-3 bg-surface-secondary rounded-lg">
              <label class="text-[11px] font-medium text-text-muted uppercase tracking-wide">
                Distribución de IVA
              </label>
              <div
                v-for="iva in ivaDistribution"
                :key="iva.key"
                class="flex flex-col gap-1"
              >
                <div class="flex justify-between text-[12px]">
                  <span class="text-text-secondary">{{ iva.label }}</span>
                  <span class="font-mono text-text-muted">{{ cat[iva.key] }}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  class="w-full"
                  :value="cat[iva.key]"
                  @input="emit('handle-iva-slider', cat.id, iva.key, $event)"
                />
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
