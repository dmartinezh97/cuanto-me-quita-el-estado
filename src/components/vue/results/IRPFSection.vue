<script setup lang="ts">
/**
 * IRPFSection.vue - IRPF breakdown with bracket bars.
 *
 * Shows each tax bracket with visual bars indicating
 * the amount paid in each range.
 */

import { computed } from 'vue';
import { Receipt } from 'lucide-vue-next';
import TramoBar from '../ui/TramoBar.vue';
import ExplanationBox from '../ui/ExplanationBox.vue';
import type { IRPFTramoDisplay } from '@/types';
import { LEARN_CONTENT } from '@/constants/learn-content';

interface Props {
  /** Total IRPF amount */
  irpfTotal: number;
  /** Effective IRPF rate as decimal */
  irpfRate: number;
  /** Annual gross salary */
  grossSalary: number;
  /** Currency formatter */
  formatCurrency: (val: number) => string;
  /** Whether learn mode is active */
  learnModeActive?: boolean;
}

const props = defineProps<Props>();

// IRPF brackets configuration (matching Spanish tax brackets)
const BRACKETS = [
  { from: 0, to: 12450, rate: 19 },
  { from: 12450, to: 20200, rate: 24 },
  { from: 20200, to: 35200, rate: 30 },
  { from: 35200, to: 60000, rate: 37 },
  { from: 60000, to: 300000, rate: 45 },
];

// Calculate IRPF by bracket
const tramos = computed<IRPFTramoDisplay[]>(() => {
  const result: IRPFTramoDisplay[] = [];
  let remainingIncome = props.grossSalary;

  for (const bracket of BRACKETS) {
    const bracketSize = bracket.to - bracket.from;
    const incomeInBracket = Math.min(Math.max(0, remainingIncome), bracketSize);
    const isActive = incomeInBracket > 0;

    // Calculate tax amount for this bracket (simple progressive calculation)
    const taxAmount = incomeInBracket * (bracket.rate / 100);

    // Calculate fill percentage (how much of this bracket is used)
    const fillPercent = bracketSize > 0 ? (incomeInBracket / bracketSize) * 100 : 0;

    result.push({
      from: bracket.from,
      to: bracket.to,
      rate: bracket.rate / 100,
      amount: taxAmount,
      isActive,
      fillPercent, // New: percentage of bracket used
    });

    remainingIncome -= bracketSize;
    if (remainingIncome <= 0) break;
  }

  // Fill remaining brackets as inactive
  while (result.length < BRACKETS.length) {
    const bracket = BRACKETS[result.length];
    result.push({
      from: bracket.from,
      to: bracket.to,
      rate: bracket.rate / 100,
      amount: 0,
      isActive: false,
      fillPercent: 0,
    });
  }

  return result;
});


// Format range label
const formatRange = (from: number, to: number): string => {
  const formatNum = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
    return n.toString();
  };
  return `${formatNum(from)} - ${formatNum(to)} €`;
};
</script>

<template>
  <div class="flex flex-col gap-5 rounded-xl bg-surface border border-border p-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-accent-light flex items-center justify-center">
          <Receipt class="w-5 h-5 text-accent" />
        </div>
        <div class="flex flex-col">
          <span class="text-base font-semibold text-text-primary">IRPF - Tramos progresivos</span>
          <span class="text-xs text-text-muted">Solo pagas el % más alto por lo que supera cada tramo</span>
        </div>
      </div>
      <div class="flex flex-col items-end">
        <span class="text-lg font-bold text-accent">
          {{ formatCurrency(irpfTotal) }}
        </span>
        <span class="text-xs text-text-muted">
          {{ (irpfRate * 100).toFixed(2) }}% efectivo
        </span>
      </div>
    </div>

    <!-- Bracket bars -->
    <div class="flex flex-col gap-2">
      <TramoBar
        v-for="(tramo, index) in tramos"
        :key="tramo.from"
        :range-label="formatRange(tramo.from, tramo.to)"
        :rate="tramo.rate * 100"
        :amount="tramo.amount"
        :fill-percent="tramo.fillPercent"
        :is-active="tramo.isActive"
        :format-currency="formatCurrency"
        :index="index"
      />
    </div>

    <!-- Learn Mode Explanation -->
    <Transition name="explanation">
      <ExplanationBox
        v-if="learnModeActive"
        variant="orange"
        :title="LEARN_CONTENT.irpf.title"
        :content="LEARN_CONTENT.irpf.content"
        :details="LEARN_CONTENT.irpf.details"
      />
    </Transition>
  </div>
</template>
