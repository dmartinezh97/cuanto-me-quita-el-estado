<script setup lang="ts">
/**
 * SSSection.vue - Social Security breakdown section.
 *
 * Shows two cards side by side:
 * - Employer SS contributions (teal)
 * - Employee SS contributions (purple)
 */

import SSBreakdownCard from '../cards/SSBreakdownCard.vue';
import type { SSBreakdown, SSBreakdownItem } from '@/types';

interface Props {
  /** Employer SS breakdown */
  employerBreakdown: SSBreakdown;
  /** Employee SS breakdown */
  employeeBreakdown: SSBreakdown;
  /** Total employer SS */
  employerTotal: number;
  /** Total employee SS */
  employeeTotal: number;
  /** Currency formatter */
  formatCurrency: (val: number) => string;
}

const props = defineProps<Props>();

// Format breakdown for employer
const employerItems: SSBreakdownItem[] = [
  { label: 'Conting. Comunes', rate: '23,60%', value: props.employerBreakdown.contingenciasComunes },
  { label: 'Desempleo', rate: '5,50%', value: props.employerBreakdown.desempleo },
  { label: 'FOGASA', rate: '0,20%', value: props.employerBreakdown.fogasa || 0 },
  { label: 'Formacion Prof.', rate: '0,60%', value: props.employerBreakdown.formacion },
  { label: 'AT y EP', rate: '~1,50%', value: props.employerBreakdown.atEp || 0 },
  { label: 'MEI', rate: '0,58%', value: props.employerBreakdown.mei },
];

// Format breakdown for employee
const employeeItems: SSBreakdownItem[] = [
  { label: 'Conting. Comunes', rate: '4,70%', value: props.employeeBreakdown.contingenciasComunes },
  { label: 'Desempleo', rate: '1,55%', value: props.employeeBreakdown.desempleo },
  { label: 'Formacion Prof.', rate: '0,10%', value: props.employeeBreakdown.formacion },
  { label: 'MEI', rate: '0,12%', value: props.employeeBreakdown.mei },
];
</script>

<template>
  <div class="flex gap-6">
    <SSBreakdownCard
      title="S.S. Empresa"
      :total="employerTotal"
      variant="employer"
      :items="employerItems"
      :format-currency="formatCurrency"
      class="flex-1"
    />
    <SSBreakdownCard
      title="S.S. Empleado"
      :total="employeeTotal"
      variant="employee"
      :items="employeeItems"
      :format-currency="formatCurrency"
      class="flex-1"
    />
  </div>
</template>
