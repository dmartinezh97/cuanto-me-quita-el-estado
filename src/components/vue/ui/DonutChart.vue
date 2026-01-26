<script setup lang="ts">
/**
 * DonutChart.vue - SVG donut chart for displaying percentages.
 *
 * Uses SVG ellipse with sweepAngle to create the donut effect.
 * The percentage is displayed in the center.
 */

interface Props {
  /** Percentage to fill (0-100) */
  percentage: number;
  /** Size in pixels */
  size?: number;
  /** Primary color for filled portion */
  fillColor?: string;
  /** Background color for unfilled portion */
  bgColor?: string;
  /** Label text below percentage */
  label?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 140,
  fillColor: 'var(--color-primary)',
  bgColor: 'var(--color-primary-light)',
  label: 'impuestos',
});

// SVG calculations
const strokeWidth = props.size * 0.1875; // 26.25px for 140px
const radius = (props.size - strokeWidth) / 2;
const circumference = 2 * Math.PI * radius;
const strokeDashoffset = circumference * (1 - props.percentage / 100);
const center = props.size / 2;
</script>

<template>
  <div
    class="relative flex items-center justify-center"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <!-- Background circle -->
    <svg
      :width="size"
      :height="size"
      class="absolute transform -rotate-90"
    >
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        :stroke="bgColor"
        :stroke-width="strokeWidth"
        fill="none"
      />
      <!-- Filled arc -->
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        :stroke="fillColor"
        :stroke-width="strokeWidth"
        fill="none"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="strokeDashoffset"
        stroke-linecap="round"
        class="transition-all duration-700 ease-out"
      />
    </svg>

    <!-- Center content -->
    <div class="flex flex-col items-center justify-center z-10">
      <span
        class="font-bold"
        :style="{
          fontFamily: 'var(--font-body)',
          fontSize: `${size * 0.17}px`,
          color: fillColor,
        }"
      >
        {{ percentage.toFixed(1) }}%
      </span>
      <span
        class="text-text-secondary"
        :style="{
          fontFamily: 'var(--font-body)',
          fontSize: `${size * 0.08}px`,
        }"
      >
        {{ label }}
      </span>
    </div>
  </div>
</template>
