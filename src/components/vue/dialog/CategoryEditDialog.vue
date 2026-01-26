<script setup lang="ts">
/**
 * CategoryEditDialog.vue - Modal dialog for editing expense category sub-items.
 *
 * Opens when clicking on a category with sub-items in the expenses section.
 * Allows editing only the numeric values (amounts) while keeping names readonly.
 */

import { ref, computed, watch, onMounted, onUnmounted, nextTick, type Component } from 'vue';
import {
  X,
  Check,
  Car,
  Home,
  ShoppingCart,
  Utensils,
  ShoppingBag,
  HeartPulse,
  MoreHorizontal,
} from 'lucide-vue-next';
import type { CategoryExpense } from '@/types';

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

interface Props {
  visible: boolean;
  category: CategoryExpense | null;
  formatCurrency: (val: number) => string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', categoryId: string, subItems: Array<{ id: string; amount: number }>): void;
}>();

// Local copy of sub-items for editing (allows cancel without affecting original)
const localSubItems = ref<Array<{ id: string; name: string; amount: number }>>([]);

// Reference to first input for focus management
const firstInputRef = ref<HTMLInputElement | null>(null);

// Computed total of all sub-item amounts
const categoryTotal = computed(() => {
  return localSubItems.value.reduce((sum, item) => sum + item.amount, 0);
});

// Deep clone sub-items when category changes
watch(
  () => props.category,
  (newCategory) => {
    if (newCategory?.subItems) {
      localSubItems.value = newCategory.subItems.map((sub) => ({
        id: sub.id,
        name: sub.name,
        amount: sub.amount,
      }));
    } else {
      localSubItems.value = [];
    }
  },
  { immediate: true }
);

// Focus first input when dialog opens
watch(
  () => props.visible,
  async (isVisible) => {
    if (isVisible) {
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      await nextTick();
      firstInputRef.value?.focus();
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
    }
  }
);

// Handle escape key
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.visible) {
    close();
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  // Ensure body scroll is restored
  document.body.style.overflow = '';
});

const close = () => {
  emit('close');
};

const save = () => {
  if (props.category) {
    emit(
      'save',
      props.category.id,
      localSubItems.value.map((item) => ({ id: item.id, amount: item.amount }))
    );
  }
};

const handleAmountInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement;
  localSubItems.value[index].amount = Number(target.value) || 0;
};
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div
        v-if="visible && category"
        class="dialog-overlay"
        @click.self="close"
      >
        <!-- Dialog -->
        <div
          class="dialog-card"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="`dialog-title-${category.id}`"
        >
            <!-- Header -->
            <div class="flex items-start justify-between p-5 border-b border-border">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center">
                  <component
                    :is="getIcon(category.id)"
                    class="w-5 h-5 text-primary"
                  />
                </div>
                <div>
                  <h2
                    :id="`dialog-title-${category.id}`"
                    class="text-[16px] font-semibold text-text-primary"
                  >
                    {{ category.name }}
                  </h2>
                  <p class="text-[12px] text-text-muted">Editar gastos de esta categoría</p>
                </div>
              </div>
              <button
                @click="close"
                class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-secondary transition-colors"
                aria-label="Cerrar"
              >
                <X class="w-5 h-5 text-text-muted" />
              </button>
            </div>

            <!-- Body -->
            <div class="p-5 max-h-[60vh] overflow-y-auto">
              <label class="section-label mb-4 block">Gastos en esta categoría</label>

              <div class="flex flex-col gap-3">
                <div
                  v-for="(sub, index) in localSubItems"
                  :key="sub.id"
                  class="flex items-center gap-3"
                >
                  <!-- Name (readonly) -->
                  <div class="flex-1">
                    <input
                      type="text"
                      :value="sub.name"
                      readonly
                      class="input-base w-full text-[13px] bg-surface-secondary cursor-not-allowed text-text-secondary"
                    />
                  </div>

                  <!-- Amount (editable) -->
                  <div class="w-28 relative">
                    <input
                      :ref="index === 0 ? (el) => (firstInputRef = el as HTMLInputElement) : undefined"
                      type="number"
                      min="0"
                      step="1"
                      :value="sub.amount"
                      @input="handleAmountInput(index, $event)"
                      class="input-base w-full text-[13px] text-right pr-7"
                    />
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-[12px]">€</span>
                  </div>
                </div>
              </div>

              <!-- Total -->
              <div class="mt-4 pt-4 border-t border-border flex justify-between items-center">
                <span class="text-[13px] font-medium text-text-secondary">Total</span>
                <span class="font-mono text-[15px] font-semibold text-text-primary">
                  {{ formatCurrency(categoryTotal) }}
                </span>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-3 p-5 border-t border-border bg-surface-secondary">
              <button
                @click="close"
                class="h-10 px-5 rounded-lg border border-border bg-surface text-[13px] font-medium text-text-secondary hover:bg-surface-secondary transition-colors"
              >
                Cancelar
              </button>
              <button
                @click="save"
                class="h-10 px-5 rounded-lg bg-primary text-surface text-[13px] font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors"
              >
                <Check class="w-4 h-4" />
                <span>Guardar</span>
              </button>
            </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Dialog overlay */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.5);
}

/* Dialog card */
.dialog-card {
  width: 100%;
  max-width: 28rem;
  background-color: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

/* Dialog transition */
.dialog-enter-active {
  transition: opacity 0.2s ease-out;
}

.dialog-enter-active .dialog-card {
  transition: opacity 0.2s ease-out, transform 0.2s ease-out;
}

.dialog-leave-active {
  transition: opacity 0.15s ease-in;
}

.dialog-leave-active .dialog-card {
  transition: opacity 0.15s ease-in, transform 0.15s ease-in;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-from .dialog-card {
  opacity: 0;
  transform: translateY(16px) scale(0.98);
}

.dialog-leave-to .dialog-card {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}
</style>
