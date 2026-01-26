<script setup lang="ts">
/**
 * PersonalDataForm.vue - Personal and economic data inputs.
 *
 * Styled according to Diseño.pen with:
 * - Large salary input with placeholder
 * - Personal situation section with 2x2 grid
 * - Labels in JetBrains Mono uppercase
 */

import { ChevronDown } from 'lucide-vue-next';
import type { AppState, AutonomousCommunity } from '@/types';

interface Props {
  state: AppState;
  allCommunities: AutonomousCommunity[];
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'update-state', patch: Partial<AppState>): void;
  (e: 'handle-age-input', event: Event): void;
}>();
</script>

<template>
  <div class="flex flex-col gap-8">
    <!-- Salary Section -->
    <div class="flex flex-col gap-4">
      <label class="section-label">Salario bruto anual</label>
      <div class="relative flex items-center">
        <input
          type="number"
          min="0"
          placeholder="Ej: 35.000"
          class="input-base input-large w-full pr-16 font-body"
          :value="state.grossSalary || ''"
          @input="emit('update-state', { grossSalary: Number(($event.target as HTMLInputElement).value) || 0 })"
        />
        <span class="absolute right-4 text-text-muted text-[14px]">€/año</span>
      </div>
    </div>

    <div class="divider"></div>

    <!-- Personal Situation Section -->
    <div class="flex flex-col gap-4">
      <label class="section-label">Situación personal</label>

      <!-- Row 1: Comunidad and Pagas -->
      <div class="grid grid-cols-2 gap-3">
        <!-- Comunidad Autónoma -->
        <div class="flex flex-col gap-1.5">
          <label class="text-[12px] text-text-secondary">Comunidad</label>
          <div class="relative">
            <select
              class="input-base w-full appearance-none pr-10 text-[14px]"
              :value="state.region"
              @change="emit('update-state', { region: ($event.target as HTMLSelectElement).value })"
            >
              <option v-for="cc in allCommunities" :key="cc.id" :value="cc.id">
                {{ cc.name }}
              </option>
            </select>
            <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          </div>
        </div>

        <!-- Pagas -->
        <div class="flex flex-col gap-1.5">
          <label class="text-[12px] text-text-secondary">Pagas</label>
          <div class="relative">
            <select
              class="input-base w-full appearance-none pr-10 text-[14px]"
              :value="state.numPayments"
              @change="emit('update-state', { numPayments: Number(($event.target as HTMLSelectElement).value) as 12 | 14 })"
            >
              <option :value="12">12 pagas</option>
              <option :value="14">14 pagas</option>
            </select>
            <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          </div>
        </div>
      </div>

      <!-- Row 2: Edad and Hijos -->
      <div class="grid grid-cols-2 gap-3">
        <!-- Edad -->
        <div class="flex flex-col gap-1.5">
          <label class="text-[12px] text-text-secondary">Edad</label>
          <input
            type="number"
            min="0"
            placeholder="30"
            class="input-base w-full text-[14px]"
            :value="state.age || ''"
            @input="emit('handle-age-input', $event)"
          />
        </div>

        <!-- Hijos -->
        <div class="flex flex-col gap-1.5">
          <label class="text-[12px] text-text-secondary">Hijos</label>
          <input
            type="number"
            min="0"
            placeholder="0"
            class="input-base w-full text-[14px]"
            :value="state.numChildren || ''"
            @input="emit('update-state', { numChildren: Number(($event.target as HTMLInputElement).value) || 0 })"
          />
        </div>
      </div>
    </div>
  </div>
</template>
