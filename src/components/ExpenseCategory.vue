<!--
  ExpenseCategory - Expandable expense category with sub-items.

  Why this exists:
  - Encapsulates the expense category display logic
  - Provides structure for both detailed (subItems) and simple (slider) modes
  - Reduces template complexity in App.vue

  Contract:
  - Props: category (CategoryExpense), ivaDistribution
  - Emits: update-amount, update-price, update-iva, update-total, focus, blur
  - Shows subItems if available, otherwise shows simple mode with IVA sliders

  Note: This component deliberately keeps some template complexity because
  the sub-item display has many edge cases (fuel, electricity, insurance, etc.)
  that would be over-engineered to abstract further.
-->

<script setup lang="ts">
import type { CategoryExpense, SubItem } from '@/types';
import { formatCurrency } from '@/utils/calculations';
import CurrencyInput from './CurrencyInput.vue';

type IVAKey = 'iva4' | 'iva10' | 'iva21';

interface IVAItem {
  key: IVAKey;
  label: string;
  color: string;
}

interface Props {
  category: CategoryExpense;
  ivaDistribution: IVAItem[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  /** When a sub-item amount changes */
  'update-amount': [catId: string, subId: string, event: Event];
  /** When fuel price per unit changes */
  'update-price': [catId: string, subId: string, event: Event];
  /** When IVA distribution slider changes */
  'update-iva': [catId: string, type: IVAKey, event: Event];
  /** When category total changes (simple mode) */
  'update-total': [catId: string, event: Event];
  /** When any input receives focus */
  focus: [event: FocusEvent];
  /** When any input loses focus */
  blur: [event: FocusEvent];
}>();

/**
 * Generates the icon container classes based on category color.
 */
const iconContainerClass = `w-10 h-10 rounded-lg bg-${props.category.color}-100 dark:bg-${props.category.color}-900/30 text-${props.category.color}-600 dark:text-${props.category.color}-400 flex items-center justify-center`;

/**
 * Determines if a sub-item's note indicates it's tax-free or deductible.
 */
const isTaxFreeNote = (note?: string): boolean => {
  if (!note) return false;
  const lower = note.toLowerCase();
  return lower.includes('deducible') || lower.includes('sin iva') || lower.includes('exento');
};

/**
 * Gets the appropriate tax info display for a sub-item.
 */
const getTaxInfoClass = (sub: SubItem): string => {
  if (sub.id === 'fuel' || sub.id === 'insurance_car' || sub.id === 'electricity' || sub.id === 'gas') {
    return 'text-red-600';
  }
  if (sub.note && isTaxFreeNote(sub.note)) {
    return 'text-green-600';
  }
  if (sub.specialTaxRate && sub.ivaRate === 0) {
    return 'text-red-600';
  }
  return sub.ivaRate > 0 ? 'text-red-600' : 'text-green-600';
};

// Event handlers that delegate to parent
const handleAmountInput = (subId: string, event: Event) => {
  emit('update-amount', props.category.id, subId, event);
};

const handlePriceInput = (subId: string, event: Event) => {
  emit('update-price', props.category.id, subId, event);
};

const handleIVASlider = (type: IVAKey, event: Event) => {
  emit('update-iva', props.category.id, type, event);
};

const handleTotalInput = (event: Event) => {
  emit('update-total', props.category.id, event);
};

const handleFocus = (event: FocusEvent) => {
  emit('focus', event);
};

const handleBlur = (event: FocusEvent) => {
  emit('blur', event);
};
</script>

<template>
  <details
    class="group bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-stone-200 dark:border-stone-700 overflow-hidden"
  >
    <!-- Header / Summary -->
    <summary
      class="flex items-center justify-between py-1 px-3 cursor-pointer bg-stone-50 dark:bg-slate-800 hover:bg-stone-100 dark:hover:bg-slate-700 transition-colors select-none"
    >
      <div class="flex items-center gap-3">
        <div :class="iconContainerClass">
          <span class="material-symbols-outlined">{{ category.icon }}</span>
        </div>
        <span class="font-semibold text-stone-700 dark:text-stone-200 uppercase tracking-tight text-sm">
          {{ category.name }}
        </span>
      </div>
      <div class="flex items-center gap-4">
        <span class="font-mono text-sm font-bold text-stone-500">
          {{ formatCurrency(category.total) }}
        </span>
        <span class="material-symbols-outlined text-stone-400 transition-transform duration-200 group-open:rotate-180">
          expand_more
        </span>
      </div>
    </summary>

    <!-- Content -->
    <div class="p-5 border-t border-stone-100 dark:border-slate-700 flex flex-col gap-6 bg-white dark:bg-slate-800">
      <!-- Detailed mode: show sub-items -->
      <div v-if="category.subItems && category.subItems.length" class="flex flex-col gap-4">
        <div
          v-for="sub in category.subItems"
          :key="sub.id"
          class="flex flex-col gap-1.5 p-3 bg-stone-50 dark:bg-slate-900/50 rounded-lg border border-stone-100 dark:border-slate-700/50"
        >
          <!-- Sub-item header with tax info -->
          <div class="flex justify-between items-start text-xs font-bold text-stone-500 uppercase mb-1">
            <label class="pt-1">{{ sub.name }}</label>
            <span class="text-[10px] text-right">
              <!-- Fuel: special display -->
              <template v-if="sub.id === 'fuel'">
                <span class="text-red-600">IEH (€0,4007/L) + IVA 21%</span>
                <br />
                <span class="normal-case font-normal italic text-stone-400">
                  se calcula al precio medio de la gasolina
                </span>
              </template>
              <!-- Car insurance -->
              <template v-else-if="sub.id === 'insurance_car'">
                <span class="text-red-600">
                  IPS {{ ((sub.specialTaxRate ?? 0) * 100).toFixed(0) }}% + recargos
                </span>
              </template>
              <!-- Electricity -->
              <template v-else-if="sub.id === 'electricity'">
                <span class="text-red-600">IVA 21% + IEE</span>
              </template>
              <!-- Gas -->
              <template v-else-if="sub.id === 'gas'">
                <span class="text-red-600">IVA 21% + Imp. Hidrocarburos (0,00234 €/kWh)</span>
              </template>
              <!-- Items with notes (e.g., "Exento", "Deducible") -->
              <template v-else-if="sub.note">
                <span :class="isTaxFreeNote(sub.note) ? 'text-green-600' : 'text-stone-400'">
                  {{ sub.note }}
                </span>
              </template>
              <!-- Insurance premium tax -->
              <template v-else-if="sub.specialTaxRate && sub.ivaRate === 0">
                <span class="text-red-600">IPS {{ (sub.specialTaxRate * 100).toFixed(0) }}%</span>
              </template>
              <!-- Standard IVA -->
              <template v-else>
                <span :class="sub.ivaRate > 0 ? 'text-red-600' : 'text-green-600'">
                  {{ sub.ivaRate > 0 ? `IVA ${sub.ivaRate}%` : 'Exento' }}
                </span>
              </template>
            </span>
          </div>

          <!-- Fuel: two inputs (amount + price per liter) -->
          <div v-if="sub.id === 'fuel'" class="grid grid-cols-2 gap-4 mt-1">
            <div class="flex flex-col gap-1">
              <label class="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                Importe Total
              </label>
              <CurrencyInput
                :model-value="sub.amount"
                input-class="expense-input bg-white"
                @input="handleAmountInput(sub.id, $event)"
                @focus="handleFocus"
                @blur="handleBlur"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                Precio medio €/L
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                :value="sub.pricePerUnit ?? ''"
                class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono text-sm text-stone-900 dark:text-white"
                @input="handlePriceInput(sub.id, $event)"
                @focus="handleFocus"
                @blur="handleBlur"
              />
            </div>
          </div>

          <!-- Standard sub-item: single amount input -->
          <CurrencyInput
            v-else
            :model-value="sub.amount"
            input-class="expense-input bg-white"
            @input="handleAmountInput(sub.id, $event)"
            @focus="handleFocus"
            @blur="handleBlur"
          />
        </div>
      </div>

      <!-- Simple mode: total input + IVA distribution sliders -->
      <template v-else>
        <div>
          <label class="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
            Gasto Mensual Total
          </label>
          <CurrencyInput
            :model-value="category.total"
            input-class="expense-input"
            @input="handleTotalInput"
            @focus="handleFocus"
            @blur="handleBlur"
          />
        </div>

        <!-- IVA distribution sliders -->
        <div class="flex flex-col gap-5 p-4 bg-stone-50 dark:bg-slate-900/50 rounded-lg border border-stone-100 dark:border-stone-700/50">
          <label class="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
            Distribución estimada de IVA
          </label>
          <div
            v-for="iva in ivaDistribution"
            :key="iva.key"
            class="flex flex-col gap-2"
          >
            <div class="flex justify-between text-xs font-medium">
              <span class="text-stone-600 dark:text-stone-300">{{ iva.label }}</span>
              <span class="font-mono text-stone-500">{{ category[iva.key] }}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              :value="category[iva.key]"
              class="w-full"
              @input="handleIVASlider(iva.key, $event)"
            />
          </div>
        </div>
      </template>
    </div>
  </details>
</template>
