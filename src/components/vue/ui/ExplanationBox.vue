<script setup lang="ts">
/**
 * ExplanationBox.vue - Reusable explanation box for Learn Mode.
 *
 * Shows educational content with different color variants
 * and animated transitions.
 */

import { computed } from 'vue';
import { Lightbulb, Info, AlertCircle, HelpCircle } from 'lucide-vue-next';

type Variant = 'teal' | 'orange' | 'yellow' | 'gray';

interface Props {
  /** Color variant */
  variant?: Variant;
  /** Box title */
  title: string;
  /** Main content text */
  content: string;
  /** Optional detail items */
  details?: readonly string[];
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'teal',
});

// Variant-based styling
const variantClasses = computed(() => {
  const variants: Record<Variant, { bg: string; border: string; iconBg: string; iconColor: string; title: string; text: string }> = {
    teal: {
      bg: 'bg-primary-light',
      border: 'border-primary/20',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      title: 'text-primary',
      text: 'text-primary/80',
    },
    orange: {
      bg: 'bg-accent-light',
      border: 'border-accent/20',
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
      title: 'text-accent-dark',
      text: 'text-accent-dark/80',
    },
    yellow: {
      bg: 'bg-warning-light',
      border: 'border-warning/20',
      iconBg: 'bg-warning/10',
      iconColor: 'text-warning',
      title: 'text-warning',
      text: 'text-warning/80',
    },
    gray: {
      bg: 'bg-surface-tertiary',
      border: 'border-border',
      iconBg: 'bg-text-muted/10',
      iconColor: 'text-text-muted',
      title: 'text-text-primary',
      text: 'text-text-secondary',
    },
  };
  return variants[props.variant];
});

// Icon component based on variant
const iconComponent = computed(() => {
  const icons: Record<Variant, typeof Lightbulb> = {
    teal: Lightbulb,
    orange: Info,
    yellow: AlertCircle,
    gray: HelpCircle,
  };
  return icons[props.variant];
});
</script>

<template>
  <div
    class="rounded-lg border p-4"
    :class="[variantClasses.bg, variantClasses.border]"
  >
    <div class="flex gap-3">
      <!-- Icon -->
      <div
        class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        :class="variantClasses.iconBg"
      >
        <component
          :is="iconComponent"
          class="w-4 h-4"
          :class="variantClasses.iconColor"
        />
      </div>

      <!-- Content -->
      <div class="flex flex-col gap-2 min-w-0">
        <!-- Title -->
        <h4
          class="text-sm font-semibold"
          :class="variantClasses.title"
        >
          {{ title }}
        </h4>

        <!-- Main content -->
        <p
          class="text-xs leading-relaxed"
          :class="variantClasses.text"
        >
          {{ content }}
        </p>

        <!-- Details list -->
        <ul
          v-if="details && details.length > 0"
          class="mt-1 space-y-1"
        >
          <li
            v-for="(detail, index) in details"
            :key="index"
            class="text-xs leading-relaxed flex items-start gap-2"
            :class="variantClasses.text"
          >
            <span class="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" :class="variantClasses.iconColor.replace('text-', 'bg-')"></span>
            <span>{{ detail }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
