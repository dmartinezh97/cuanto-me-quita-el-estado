<script setup lang="ts">
/**
 * ResumenFinal.vue - Dark summary bar at bottom.
 *
 * Shows total taxes and monthly net salary (12 and 14 payments).
 */

interface Props {
  /** Total taxes going to state (annual) */
  stateShareAnnual: number;
  /** Net salary with 12 payments */
  netMonthly12: number;
  /** Net salary with 14 payments */
  netMonthly14: number;
  /** Currency formatter */
  formatCurrency: (val: number) => string;
}

defineProps<Props>();
</script>

<template>
  <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between rounded-xl bg-text-primary p-6 gap-4 lg:gap-0">
    <!-- Left: Text summary (arriba en móvil) -->
    <div class="flex flex-col gap-1">
      <span class="text-sm text-white/70">
        Del coste total de tu trabajo...
      </span>
      <span class="text-xl font-semibold text-white">
        El Estado se queda con <span class="text-red-500">{{ formatCurrency(stateShareAnnual) }}</span> al año
      </span>
    </div>

    <!-- Right: Monthly stats (abajo en móvil) -->
    <div class="flex gap-8 justify-center lg:justify-end">
      <div class="flex flex-col items-center gap-1">
        <span class="text-2xl font-bold text-primary">
          {{ formatCurrency(netMonthly12) }}
        </span>
        <span class="text-[11px] text-white/70">
          Neto mensual (12p)
        </span>
      </div>
      <div class="flex flex-col items-center gap-1">
        <span class="text-2xl font-bold text-primary">
          {{ formatCurrency(netMonthly14) }}
        </span>
        <span class="text-[11px] text-white/70">
          Neto mensual (14p)
        </span>
      </div>
    </div>
  </div>
</template>
