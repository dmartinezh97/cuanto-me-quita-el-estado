<script setup lang="ts">
/**
 * Badge.vue - Small badge for displaying rates or labels.
 *
 * Used for IVA rate badges (21%, 10%, 4%) with color variants.
 */

interface Props {
  /** Text to display */
  text: string;
  /** Color variant */
  variant?: 'warning' | 'success' | 'primary' | 'accent';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'warning',
});

const variantClasses: Record<string, string> = {
  warning: 'bg-warning text-white',
  success: 'bg-emerald-500 text-white',
  primary: 'bg-primary text-white',
  accent: 'bg-accent text-white',
};
</script>

<template>
  <span
    class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold"
    :class="variantClasses[variant]"
  >
    {{ text }}
  </span>
</template>
