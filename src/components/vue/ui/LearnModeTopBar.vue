<script setup lang="ts">
/**
 * LearnModeTopBar.vue - Top bar toggle for Learn Mode.
 *
 * Fixed bar at the top of the results panel that allows
 * users to toggle educational explanations.
 */

import { GraduationCap } from 'lucide-vue-next';

interface Props {
  /** Whether learn mode is active */
  isActive: boolean;
}

interface Emits {
  (e: 'toggle'): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>

<template>
  <div
    class="flex items-center justify-between px-4 lg:px-6 py-3 rounded-xl border transition-colors duration-200"
    :class="isActive ? 'bg-primary-light border-primary/20' : 'bg-surface border-border'"
  >
    <div class="flex items-center gap-2 lg:gap-3">
      <!-- Icon -->
      <div
        class="w-8 h-8 lg:w-9 lg:h-9 rounded-lg flex items-center justify-center transition-colors duration-200"
        :class="isActive ? 'bg-primary/10' : 'bg-surface-tertiary'"
      >
        <GraduationCap
          class="w-5 h-5 transition-colors duration-200"
          :class="isActive ? 'text-primary' : 'text-text-muted'"
        />
      </div>

      <!-- Text -->
      <div class="flex flex-col">
        <span
          class="text-sm font-semibold transition-colors duration-200"
          :class="isActive ? 'text-primary' : 'text-text-primary'"
        >
          Modo Aprender
          <span v-if="isActive" class="font-normal text-primary/70">activado</span>
        </span>
        <span
          v-if="isActive"
          class="text-xs text-primary/60"
        >
          Las explicaciones aparecen en cada sección
        </span>
        <span
          v-else
          class="text-xs text-text-muted"
        >
          Activa para ver explicaciones educativas
        </span>
      </div>
    </div>

    <!-- Toggle -->
    <button
      type="button"
      class="toggle-switch"
      :class="{ active: isActive }"
      @click="$emit('toggle')"
      :aria-pressed="isActive"
      aria-label="Activar modo aprender"
    />
  </div>
</template>
